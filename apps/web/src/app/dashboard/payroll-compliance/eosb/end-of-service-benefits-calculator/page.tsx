"use client";

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Calendar,
  DollarSign,
  ArrowLeft,
  Info,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/stores/theme-store';

type CountryCode = 'AE' | 'SA' | 'BH' | 'QA' | 'OM' | 'KW' | 'IN';
type TerminationType = 'RESIGNATION' | 'TERMINATION' | 'TERMINATION_WITHOUT_CAUSE' | 'END_OF_CONTRACT' | 'RETIREMENT' | 'DEATH' | 'DISABILITY' | 'MUTUAL_AGREEMENT';

interface CalculationResult {
  employeeId: string;
  countryCode: string;
  currency: string;
  yearsOfService: number;
  monthsOfService: number;
  daysOfService: number;
  basicSalary: number;
  dailyRate: number;
  firstPeriodYears: number;
  firstPeriodDays: number;
  firstPeriodAmount: number;
  secondPeriodYears: number;
  secondPeriodDays: number;
  secondPeriodAmount: number;
  grossAmount: number;
  terminationType: string;
  resignationFactor: number;
  adjustedAmount: number;
  deductions: number;
  netAmount: number;
  calculationDetails: {
    law: string;
    formula: string;
    notes: string[];
    notesAr: string[];
  };
}

interface CountryRules {
  countryCode: string;
  eosb: {
    firstPeriodYears: number;
    firstPeriodDaysPerYear: number;
    afterPeriodDaysPerYear: number;
    maxMonths?: number;
    resignationFactor1?: number;
    resignationFactor2?: number;
    minServiceMonths: number;
    calculationBase: string;
  };
  currency: string;
}

const countries = [
  { code: 'AE', name: 'United Arab Emirates', nameAr: 'الإمارات', flag: '🇦🇪', currency: 'AED' },
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية', flag: '🇸🇦', currency: 'SAR' },
  { code: 'BH', name: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭', currency: 'BHD' },
  { code: 'QA', name: 'Qatar', nameAr: 'قطر', flag: '🇶🇦', currency: 'QAR' },
  { code: 'OM', name: 'Oman', nameAr: 'عمان', flag: '🇴🇲', currency: 'OMR' },
  { code: 'KW', name: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼', currency: 'KWD' },
  { code: 'IN', name: 'India', nameAr: 'الهند', flag: '🇮🇳', currency: 'INR' },
];

const terminationTypes = [
  { code: 'RESIGNATION', name: 'Resignation', nameAr: 'استقالة' },
  { code: 'TERMINATION', name: 'Termination', nameAr: 'إنهاء خدمة' },
  { code: 'TERMINATION_WITHOUT_CAUSE', name: 'Termination Without Cause', nameAr: 'إنهاء خدمة بدون سبب' },
  { code: 'END_OF_CONTRACT', name: 'End of Contract', nameAr: 'انتهاء العقد' },
  { code: 'RETIREMENT', name: 'Retirement', nameAr: 'تقاعد' },
  { code: 'DEATH', name: 'Death', nameAr: 'وفاة' },
  { code: 'DISABILITY', name: 'Disability', nameAr: 'إعاقة' },
  { code: 'MUTUAL_AGREEMENT', name: 'Mutual Agreement', nameAr: 'اتفاق متبادل' },
];

export default function EOSBPage() {
  const { isDark } = useTheme();
  const [countryCode, setCountryCode] = useState<CountryCode>('AE');
  const [terminationType, setTerminationType] = useState<TerminationType>('RESIGNATION');
  const [joiningDate, setJoiningDate] = useState('');
  const [lastWorkingDate, setLastWorkingDate] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [contractType, setContractType] = useState<'FIXED' | 'INDEFINITE'>('INDEFINITE');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [countryRules, setCountryRules] = useState<CountryRules | null>(null);

  // Loading / error states
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rulesLoading, setRulesLoading] = useState(false);

  const selectedCountry = countries.find(c => c.code === countryCode);

  // Fetch country-specific EOSB rules when country changes
  useEffect(() => {
    const fetchCountryRules = async () => {
      setRulesLoading(true);
      try {
        const res = await fetch(`/api/compliance/eosb?countryCode=${countryCode}`);
        const data = await res.json();
        if (data.success) {
          setCountryRules(data.data);
        }
      } catch {
        // Silently fail - rules display will fall back to generic
      } finally {
        setRulesLoading(false);
      }
    };
    fetchCountryRules();
  }, [countryCode]);

  // Clear result when inputs change
  useEffect(() => {
    setResult(null);
  }, [countryCode, terminationType]);

  const handleCalculate = async () => {
    if (!joiningDate || !lastWorkingDate || !basicSalary) return;

    setCalculating(true);
    setError(null);

    try {
      const res = await fetch('/api/compliance/eosb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: 'calculator',
          countryCode,
          joiningDate,
          lastWorkingDate,
          basicSalary: parseFloat(basicSalary),
          terminationType,
          contractType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to calculate EOSB');
        return;
      }

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Calculation failed');
      }
    } catch {
      setError('Failed to connect to EOSB calculation service');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div 
      className="space-y-4 pb-6 text-slate-900 dark:text-slate-100"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <Link href="/dashboard/payroll-compliance" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Compliance
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Calculator className="w-7 h-7 text-amber-500" />
            EOSB Calculator
            <span className="text-sm font-normal text-slate-500 mr-2">|</span>
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">حاسبة مكافأة نهاية الخدمة</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Calculate end of service benefits / gratuity for GCC countries and India
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4 text-red-400 hover:text-red-600" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Calculator Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-100">
            Calculate EOSB
            <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">حساب المكافأة</span>
          </h2>

          <div className="space-y-5">
            {/* Country Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Country | <span dir="rtl">الدولة</span>
              </label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => setCountryCode(country.code as CountryCode)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      countryCode === country.code
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{country.flag}</span>
                    <span className="text-xs font-medium">{country.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Termination Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Termination Type | <span dir="rtl">نوع إنهاء الخدمة</span>
              </label>
              <select
                value={terminationType}
                onChange={(e) => setTerminationType(e.target.value as TerminationType)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {terminationTypes.map((type) => (
                  <option key={type.code} value={type.code} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    {type.name} | {type.nameAr}
                  </option>
                ))}
              </select>
            </div>

            {/* Contract Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Contract Type | <span dir="rtl">نوع العقد</span>
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as 'FIXED' | 'INDEFINITE')}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="INDEFINITE" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Indefinite | غير محدد المدة</option>
                <option value="FIXED" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Fixed Term | محدد المدة</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Joining Date | <span dir="rtl">تاريخ الالتحاق</span>
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Last Working Date | <span dir="rtl">آخر يوم عمل</span>
                </label>
                <input
                  type="date"
                  value={lastWorkingDate}
                  onChange={(e) => setLastWorkingDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Basic Salary */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Basic Salary ({selectedCountry?.currency}) | <span dir="rtl">الراتب الأساسي</span>
              </label>
              <input
                type="number"
                value={basicSalary}
                onChange={(e) => setBasicSalary(e.target.value)}
                placeholder="Enter basic salary"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            <button
              onClick={handleCalculate}
              disabled={calculating || !joiningDate || !lastWorkingDate || !basicSalary}
              className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calculating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  Calculate EOSB | <span dir="rtl">احسب المكافأة</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-100">
            Calculation Result
            <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">نتيجة الحساب</span>
          </h2>

          {result ? (
            <div className="space-y-4">
              {/* Service Duration */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Service Duration</div>
                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {result.yearsOfService} years, {result.monthsOfService - (result.yearsOfService * 12)} months
                </div>
                <div className="text-sm text-indigo-500 dark:text-indigo-400/80">{result.daysOfService} days total</div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{result.currency} {result.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Daily Rate</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{result.currency} {result.dailyRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">
                    First Period ({result.firstPeriodDays} days)
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{result.currency} {result.firstPeriodAmount.toFixed(2)}</span>
                </div>
                {result.secondPeriodAmount > 0 && (
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">
                      Second Period ({result.secondPeriodDays} days)
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{result.currency} {result.secondPeriodAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Gross Amount</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{result.currency} {result.grossAmount.toFixed(2)}</span>
                </div>
                {result.resignationFactor < 1 && (
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-amber-600 dark:text-amber-400">Resignation Factor</span>
                    <span className="font-medium text-amber-600">x {(result.resignationFactor * 100).toFixed(0)}%</span>
                  </div>
                )}
                {result.deductions > 0 && (
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-red-600 dark:text-red-400">Deductions</span>
                    <span className="font-medium text-red-600">- {result.currency} {result.deductions.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Calculation Details */}
              {result.calculationDetails && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm">
                  <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">Legal Reference</div>
                  <div className="text-slate-500">{result.calculationDetails.law}</div>
                  <div className="text-xs text-slate-400 mt-1">Formula: {result.calculationDetails.formula}</div>
                  {result.calculationDetails.notes.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.calculationDetails.notes.map((note, i) => (
                        <li key={i} className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1">
                          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Final Amount */}
              <div className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white">
                <div className="text-sm opacity-90 mb-1">Net EOSB Amount | <span dir="rtl">صافي المكافأة</span></div>
                <div className="text-4xl font-bold">
                  {result.currency} {result.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  View Details
                </button>
                <button className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Enter employee details and click Calculate</p>
                <p className="text-sm mt-1" dir="rtl">أدخل بيانات الموظف واضغط احسب</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Country-Specific Rules */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
          {selectedCountry?.name} EOSB Rules
          <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">قواعد مكافأة نهاية الخدمة</span>
        </h2>
        {rulesLoading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading rules...
          </div>
        ) : countryRules?.eosb ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                {countryRules.eosb.firstPeriodYears > 0
                  ? `First ${countryRules.eosb.firstPeriodYears} Years`
                  : 'Rate per Year'}
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{countryRules.eosb.firstPeriodDaysPerYear} days per year</div>
              <div className="text-sm text-slate-400 dark:text-slate-500" dir="rtl">{countryRules.eosb.firstPeriodDaysPerYear} يوم لكل سنة</div>
            </div>
            {countryRules.eosb.firstPeriodYears > 0 && countryRules.eosb.afterPeriodDaysPerYear !== countryRules.eosb.firstPeriodDaysPerYear && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">After {countryRules.eosb.firstPeriodYears} Years</div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{countryRules.eosb.afterPeriodDaysPerYear} days per year</div>
                <div className="text-sm text-slate-400 dark:text-slate-500" dir="rtl">{countryRules.eosb.afterPeriodDaysPerYear} يوم لكل سنة</div>
              </div>
            )}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Minimum Service Required</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{countryRules.eosb.minServiceMonths} months</div>
              <div className="text-sm text-slate-400 dark:text-slate-500" dir="rtl">{countryRules.eosb.minServiceMonths} شهر كحد أدنى</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Calculation Base</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{countryRules.eosb.calculationBase === 'BASIC' ? 'Basic Salary' : 'Total Salary'}</div>
              <div className="text-sm text-slate-400 dark:text-slate-500" dir="rtl">الراتب الأساسي</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">First 5 Years</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">21 days per year</div>
              <div className="text-sm text-slate-400 dark:text-slate-500" dir="rtl">21 يوم لكل سنة</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">After 5 Years</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">30 days per year</div>
              <div className="text-sm text-slate-400 dark:text-slate-500" dir="rtl">30 يوم لكل سنة</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Calculation Base</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Basic Salary</div>
              <div className="text-sm text-slate-400 dark:text-slate-500" dir="rtl">الراتب الأساسي</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

