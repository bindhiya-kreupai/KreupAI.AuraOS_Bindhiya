"use client";

import React, { useState } from 'react';
import {
  Scale,
  ArrowLeft,
  Clock,
  Calendar,
  Users,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Calculator,
  Sun,
  Moon,
  Plane,
  Baby,
  Heart,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';

// Country configurations
const COUNTRIES = [
  { code: 'AE', name: 'UAE', nameAr: 'الإمارات', flag: '🇦🇪', color: 'emerald' },
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية', flag: '🇸🇦', color: 'green' },
  { code: 'BH', name: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭', color: 'red' },
  { code: 'QA', name: 'Qatar', nameAr: 'قطر', flag: '🇶🇦', color: 'purple' },
  { code: 'OM', name: 'Oman', nameAr: 'عمان', flag: '🇴🇲', color: 'rose' },
  { code: 'KW', name: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼', color: 'cyan' },
  { code: 'IN', name: 'India', nameAr: 'الهند', flag: '🇮🇳', color: 'orange' },
];

// Labour law configurations by country
const LABOUR_LAWS: Record<string, {
  workingHours: { standard: number; ramadan: number; maxOvertime: number };
  overtime: { normal: number; night: number; holiday: number };
  probation: { max: number; notice: number };
  leave: {
    annual: { firstYear: number; afterYears: number; threshold: number };
    sick: { fullPay: number; halfPay: number; unpaid: number };
    maternity: { days: number; fullPay: number };
    paternity: number;
    bereavement: { spouse: number; family: number };
    hajj?: { days: number; minService?: number };
  };
  eosb: { firstPeriod: number; firstRate: number; afterRate: number; min: number };
  weekend: string[];
  legalRef: string;
}> = {
  AE: {
    workingHours: { standard: 8, ramadan: 6, maxOvertime: 2 },
    overtime: { normal: 125, night: 150, holiday: 150 },
    probation: { max: 180, notice: 14 },
    leave: {
      annual: { firstYear: 24, afterYears: 30, threshold: 1 },
      sick: { fullPay: 15, halfPay: 30, unpaid: 45 },
      maternity: { days: 60, fullPay: 45 },
      paternity: 5,
      bereavement: { spouse: 5, family: 3 },
      hajj: { days: 30 },
    },
    eosb: { firstPeriod: 5, firstRate: 21, afterRate: 30, min: 12 },
    weekend: ['Friday', 'Saturday'],
    legalRef: 'Federal Decree-Law No. 33 of 2021',
  },
  SA: {
    workingHours: { standard: 8, ramadan: 6, maxOvertime: 720 },
    overtime: { normal: 150, night: 150, holiday: 150 },
    probation: { max: 90, notice: 30 },
    leave: {
      annual: { firstYear: 21, afterYears: 30, threshold: 5 },
      sick: { fullPay: 30, halfPay: 60, unpaid: 30 },
      maternity: { days: 70, fullPay: 70 },
      paternity: 3,
      bereavement: { spouse: 5, family: 3 },
      hajj: { days: 15, minService: 2 },
    },
    eosb: { firstPeriod: 5, firstRate: 15, afterRate: 30, min: 24 },
    weekend: ['Friday', 'Saturday'],
    legalRef: 'Royal Decree No. M/51',
  },
  BH: {
    workingHours: { standard: 8, ramadan: 6, maxOvertime: 2 },
    overtime: { normal: 125, night: 150, holiday: 150 },
    probation: { max: 90, notice: 30 },
    leave: {
      annual: { firstYear: 30, afterYears: 30, threshold: 1 },
      sick: { fullPay: 15, halfPay: 20, unpaid: 20 },
      maternity: { days: 60, fullPay: 60 },
      paternity: 1,
      bereavement: { spouse: 3, family: 3 },
      hajj: { days: 14, minService: 5 },
    },
    eosb: { firstPeriod: 3, firstRate: 15, afterRate: 30, min: 12 },
    weekend: ['Friday', 'Saturday'],
    legalRef: 'Labour Law No. 36 of 2012',
  },
  QA: {
    workingHours: { standard: 8, ramadan: 6, maxOvertime: 2 },
    overtime: { normal: 125, night: 150, holiday: 150 },
    probation: { max: 180, notice: 30 },
    leave: {
      annual: { firstYear: 21, afterYears: 28, threshold: 5 },
      sick: { fullPay: 14, halfPay: 28, unpaid: 0 },
      maternity: { days: 50, fullPay: 50 },
      paternity: 3,
      bereavement: { spouse: 7, family: 3 },
      hajj: { days: 14, minService: 5 },
    },
    eosb: { firstPeriod: 0, firstRate: 21, afterRate: 21, min: 12 },
    weekend: ['Friday', 'Saturday'],
    legalRef: 'Labour Law No. 14 of 2004',
  },
  OM: {
    workingHours: { standard: 9, ramadan: 6, maxOvertime: 2 },
    overtime: { normal: 125, night: 150, holiday: 150 },
    probation: { max: 90, notice: 30 },
    leave: {
      annual: { firstYear: 30, afterYears: 30, threshold: 1 },
      sick: { fullPay: 10, halfPay: 10, unpaid: 32 },
      maternity: { days: 50, fullPay: 50 },
      paternity: 3,
      bereavement: { spouse: 7, family: 3 },
      hajj: { days: 15, minService: 3 },
    },
    eosb: { firstPeriod: 0, firstRate: 15, afterRate: 15, min: 12 },
    weekend: ['Friday', 'Saturday'],
    legalRef: 'Royal Decree 35/2003',
  },
  KW: {
    workingHours: { standard: 8, ramadan: 6, maxOvertime: 2 },
    overtime: { normal: 125, night: 150, holiday: 200 },
    probation: { max: 100, notice: 30 },
    leave: {
      annual: { firstYear: 30, afterYears: 30, threshold: 1 },
      sick: { fullPay: 15, halfPay: 10, unpaid: 50 },
      maternity: { days: 70, fullPay: 70 },
      paternity: 3,
      bereavement: { spouse: 5, family: 3 },
      hajj: { days: 21, minService: 2 },
    },
    eosb: { firstPeriod: 5, firstRate: 15, afterRate: 30, min: 12 },
    weekend: ['Friday', 'Saturday'],
    legalRef: 'Labour Law No. 6 of 2010',
  },
  IN: {
    workingHours: { standard: 9, ramadan: 9, maxOvertime: 2 },
    overtime: { normal: 200, night: 200, holiday: 200 },
    probation: { max: 180, notice: 30 },
    leave: {
      annual: { firstYear: 15, afterYears: 15, threshold: 1 },
      sick: { fullPay: 7, halfPay: 0, unpaid: 0 },
      maternity: { days: 182, fullPay: 182 },
      paternity: 15,
      bereavement: { spouse: 5, family: 3 },
    },
    eosb: { firstPeriod: 0, firstRate: 15, afterRate: 15, min: 60 },
    weekend: ['Saturday', 'Sunday'],
    legalRef: 'Code on Wages 2019',
  },
};

export default function LabourLawPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>('AE');
  const [expandedSection, setExpandedSection] = useState<string | null>('working-hours');

  const country = COUNTRIES.find(c => c.code === selectedCountry)!;
  const law = LABOUR_LAWS[selectedCountry];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/payroll-compliance" className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Compliance
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Scale className="w-7 h-7 text-indigo-500" />
            Labour Law Compliance
            <span className="text-sm font-normal text-slate-500 mr-2">|</span>
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">امتثال قانون العمل</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Country-specific labour regulations and compliance rules
            <span className="mx-2">•</span>
            <span dir="rtl">اللوائح الخاصة بكل دولة وقواعد الامتثال</span>
          </p>
        </div>
      </div>

      {/* Country Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Select Country | <span dir="rtl">اختر الدولة</span>
        </h2>
        <div className="flex flex-wrap gap-3">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCountry(c.code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                selectedCountry === c.code
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span className="text-xl">{c.flag}</span>
              <span className="font-medium">{c.name}</span>
              <span className="text-slate-400">|</span>
              <span className="text-sm" dir="rtl">{c.nameAr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Country Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{country.flag}</div>
          <div>
            <h2 className="text-2xl font-bold">{country.name} Labour Law</h2>
            <p className="text-indigo-200" dir="rtl">قانون العمل في {country.nameAr}</p>
            <p className="text-sm text-indigo-200 mt-1">
              Reference: {law.legalRef}
            </p>
          </div>
        </div>
      </div>

      {/* Labour Law Sections */}
      <div className="space-y-4">
        {/* Working Hours Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleSection('working-hours')}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Working Hours & Overtime</h3>
                <p className="text-sm text-slate-500" dir="rtl">ساعات العمل والعمل الإضافي</p>
              </div>
            </div>
            {expandedSection === 'working-hours' ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {expandedSection === 'working-hours' && (
            <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                    <Sun className="w-4 h-4" />
                    <span className="text-sm font-medium">Standard Hours</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{law.workingHours.standard} hrs/day</div>
                  <div className="text-sm text-slate-500" dir="rtl">{law.workingHours.standard} ساعات / يوم</div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                    <Moon className="w-4 h-4" />
                    <span className="text-sm font-medium">Ramadan Hours</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{law.workingHours.ramadan} hrs/day</div>
                  <div className="text-sm text-slate-500" dir="rtl">{law.workingHours.ramadan} ساعات / يوم</div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Max Overtime</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {law.workingHours.maxOvertime > 10 ? `${law.workingHours.maxOvertime} hrs/year` : `${law.workingHours.maxOvertime} hrs/day`}
                  </div>
                  <div className="text-sm text-slate-500" dir="rtl">الحد الأقصى للعمل الإضافي</div>
                </div>
              </div>

              <h4 className="font-medium text-slate-700 dark:text-slate-300 mt-6 mb-3">
                Overtime Rates | <span dir="rtl">معدلات العمل الإضافي</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-500">Normal Overtime</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{law.overtime.normal}%</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-500">Night Overtime</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{law.overtime.night}%</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-500">Holiday Overtime</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{law.overtime.holiday}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Leave Entitlements Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleSection('leave')}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Leave Entitlements</h3>
                <p className="text-sm text-slate-500" dir="rtl">استحقاقات الإجازات</p>
              </div>
            </div>
            {expandedSection === 'leave' ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {expandedSection === 'leave' && (
            <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Annual Leave */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                    <Plane className="w-4 h-4" />
                    <span className="text-sm font-medium">Annual Leave</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {law.leave.annual.firstYear === law.leave.annual.afterYears
                      ? `${law.leave.annual.afterYears} days`
                      : `${law.leave.annual.firstYear} → ${law.leave.annual.afterYears} days`}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {law.leave.annual.threshold > 1 && `After ${law.leave.annual.threshold} years service`}
                  </div>
                  <div className="text-sm text-slate-500 mt-1" dir="rtl">إجازة سنوية</div>
                </div>

                {/* Sick Leave */}
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm font-medium">Sick Leave</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm"><span className="font-semibold">{law.leave.sick.fullPay}</span> days @ 100%</div>
                    {law.leave.sick.halfPay > 0 && (
                      <div className="text-sm"><span className="font-semibold">{law.leave.sick.halfPay}</span> days @ 50-75%</div>
                    )}
                    {law.leave.sick.unpaid > 0 && (
                      <div className="text-sm text-slate-400"><span className="font-semibold">{law.leave.sick.unpaid}</span> days unpaid</div>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 mt-1" dir="rtl">إجازة مرضية</div>
                </div>

                {/* Maternity Leave */}
                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                  <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-2">
                    <Baby className="w-4 h-4" />
                    <span className="text-sm font-medium">Maternity Leave</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{law.leave.maternity.days} days</div>
                  <div className="text-xs text-slate-500 mt-1">{law.leave.maternity.fullPay} days at full pay</div>
                  <div className="text-sm text-slate-500 mt-1" dir="rtl">إجازة أمومة</div>
                </div>

                {/* Paternity Leave */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Paternity Leave</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{law.leave.paternity} days</div>
                  <div className="text-sm text-slate-500 mt-1" dir="rtl">إجازة أبوة</div>
                </div>

                {/* Bereavement Leave */}
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm font-medium">Bereavement Leave</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm">Spouse: <span className="font-semibold">{law.leave.bereavement.spouse}</span> days</div>
                    <div className="text-sm">Family: <span className="font-semibold">{law.leave.bereavement.family}</span> days</div>
                  </div>
                  <div className="text-sm text-slate-500 mt-1" dir="rtl">إجازة عزاء</div>
                </div>

                {/* Hajj Leave */}
                {law.leave.hajj && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-sm font-medium">Hajj Leave</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{law.leave.hajj.days} days</div>
                    {law.leave.hajj.minService && (
                      <div className="text-xs text-slate-500 mt-1">After {law.leave.hajj.minService} years service</div>
                    )}
                    <div className="text-xs text-slate-500">Once during employment (unpaid)</div>
                    <div className="text-sm text-slate-500 mt-1" dir="rtl">إجازة حج</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Probation Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleSection('probation')}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Probation Period</h3>
                <p className="text-sm text-slate-500" dir="rtl">فترة الاختبار</p>
              </div>
            </div>
            {expandedSection === 'probation' ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {expandedSection === 'probation' && (
            <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <div className="text-sm text-amber-600 dark:text-amber-400 mb-1">Maximum Probation Period</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{law.probation.max} days</div>
                  <div className="text-sm text-slate-500">{Math.round(law.probation.max / 30)} months</div>
                  <div className="text-sm text-slate-500 mt-1" dir="rtl">الحد الأقصى لفترة الاختبار</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Notice Period (During Probation)</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{law.probation.notice} days</div>
                  <div className="text-sm text-slate-500 mt-1" dir="rtl">فترة الإشعار</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* EOSB Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleSection('eosb')}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">End of Service Benefits (EOSB)</h3>
                <p className="text-sm text-slate-500" dir="rtl">مكافأة نهاية الخدمة</p>
              </div>
            </div>
            {expandedSection === 'eosb' ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {expandedSection === 'eosb' && (
            <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                    {law.eosb.firstPeriod > 0 ? `First ${law.eosb.firstPeriod} Years` : 'Rate per Year'}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{law.eosb.firstRate} days</div>
                  <div className="text-sm text-slate-500">per year of service</div>
                  <div className="text-sm text-slate-500 mt-1" dir="rtl">يوم لكل سنة خدمة</div>
                </div>
                {law.eosb.firstPeriod > 0 && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">After {law.eosb.firstPeriod} Years</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{law.eosb.afterRate} days</div>
                    <div className="text-sm text-slate-500">per year of service</div>
                    <div className="text-sm text-slate-500 mt-1" dir="rtl">يوم لكل سنة خدمة</div>
                  </div>
                )}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Minimum Service Required</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{law.eosb.min} months</div>
                  <div className="text-sm text-slate-500">{Math.round(law.eosb.min / 12)} year{law.eosb.min >= 24 ? &apos;s' : ''}</div>
                  <div className="text-sm text-slate-500 mt-1" dir="rtl">الحد الأدنى للخدمة</div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      EOSB is calculated on the <strong>last basic salary</strong> only (excluding allowances in most GCC countries).
                      Resignation before completing minimum service may result in reduced or no gratuity.
                    </p>
                    <p className="text-xs text-amber-600 mt-1" dir="rtl">
                      تحسب المكافأة على الراتب الأساسي الأخير فقط. الاستقالة قبل إكمال الحد الأدنى من الخدمة قد تؤدي إلى تخفيض أو عدم استحقاق المكافأة.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Weekend Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleSection('weekend')}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Weekend & Work Week</h3>
                <p className="text-sm text-slate-500" dir="rtl">عطلة نهاية الأسبوع</p>
              </div>
            </div>
            {expandedSection === 'weekend' ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {expandedSection === 'weekend' && (
            <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                  <div className="text-sm text-cyan-600 dark:text-cyan-400 mb-2">Official Weekend</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {law.weekend.join(' & ')}
                  </div>
                  <div className="text-sm text-slate-500 mt-1" dir="rtl">عطلة نهاية الأسبوع الرسمية</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="text-sm text-slate-500 mb-2">Work Week Starts</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {law.weekend.includes('Saturday') && law.weekend.includes('Sunday') ? 'Monday' : 'Sunday'}
                  </div>
                  <div className="text-sm text-slate-500 mt-1" dir="rtl">يبدأ أسبوع العمل</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Quick View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Quick Comparison | <span dir="rtl">مقارنة سريعة</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="pb-3 font-medium">Country</th>
                <th className="pb-3 font-medium text-center">Working Hours</th>
                <th className="pb-3 font-medium text-center">Annual Leave</th>
                <th className="pb-3 font-medium text-center">Maternity</th>
                <th className="pb-3 font-medium text-center">EOSB Rate</th>
                <th className="pb-3 font-medium text-center">Probation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {COUNTRIES.map((c) => {
                const l = LABOUR_LAWS[c.code];
                return (
                  <tr key={c.code} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedCountry === c.code ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                    <td className="py-3">
                      <span className="mr-2">{c.flag}</span>
                      {c.name}
                    </td>
                    <td className="py-3 text-center">{l.workingHours.standard} hrs</td>
                    <td className="py-3 text-center">{l.leave.annual.afterYears} days</td>
                    <td className="py-3 text-center">{l.leave.maternity.days} days</td>
                    <td className="py-3 text-center">{l.eosb.afterRate} days/yr</td>
                    <td className="py-3 text-center">{l.probation.max} days</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
