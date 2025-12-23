"use client";

import React, { useState } from 'react';
import {
  Calculator,
  Calendar,
  DollarSign,
  ArrowLeft,
  Info,
  FileText,
  Download
} from 'lucide-react';
import Link from 'next/link';

type CountryCode = 'AE' | 'SA' | 'BH' | 'QA' | 'OM' | 'KW' | 'IN';
type TerminationType = 'RESIGNATION' | 'TERMINATION' | 'END_OF_CONTRACT' | 'RETIREMENT' | 'DEATH';

interface CalculationResult {
  yearsOfService: number;
  monthsOfService: number;
  daysOfService: number;
  basicSalary: number;
  dailyRate: number;
  firstPeriodAmount: number;
  secondPeriodAmount: number;
  grossAmount: number;
  resignationFactor: number;
  adjustedAmount: number;
  netAmount: number;
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
  { code: 'END_OF_CONTRACT', name: 'End of Contract', nameAr: 'انتهاء العقد' },
  { code: 'RETIREMENT', name: 'Retirement', nameAr: 'تقاعد' },
  { code: 'DEATH', name: 'Death', nameAr: 'وفاة' },
];

export default function EOSBPage() {
  const [countryCode, setCountryCode] = useState<CountryCode>('AE');
  const [terminationType, setTerminationType] = useState<TerminationType>('RESIGNATION');
  const [joiningDate, setJoiningDate] = useState('');
  const [lastWorkingDate, setLastWorkingDate] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const selectedCountry = countries.find(c => c.code === countryCode);

  const handleCalculate = () => {
    if (!joiningDate || !lastWorkingDate || !basicSalary) return;

    const start = new Date(joiningDate);
    const end = new Date(lastWorkingDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = diffDays / 365;
    const salary = parseFloat(basicSalary);
    const dailyRate = salary / 30;

    // Calculate based on UAE rules (simplified)
    let firstPeriodAmount = 0;
    let secondPeriodAmount = 0;

    if (years <= 5) {
      firstPeriodAmount = years * 21 * dailyRate;
    } else {
      firstPeriodAmount = 5 * 21 * dailyRate;
      secondPeriodAmount = (years - 5) * 30 * dailyRate;
    }

    const grossAmount = firstPeriodAmount + secondPeriodAmount;

    // Resignation factor based on service years
    let resignationFactor = 1;
    if (terminationType === 'RESIGNATION') {
      if (years < 1) resignationFactor = 0;
      else if (years < 3) resignationFactor = 0.33;
      else if (years < 5) resignationFactor = 0.67;
    }

    const adjustedAmount = grossAmount * resignationFactor;

    setResult({
      yearsOfService: Math.floor(years),
      monthsOfService: Math.floor((years % 1) * 12),
      daysOfService: diffDays,
      basicSalary: salary,
      dailyRate,
      firstPeriodAmount,
      secondPeriodAmount,
      grossAmount,
      resignationFactor,
      adjustedAmount,
      netAmount: adjustedAmount,
      currency: selectedCountry?.currency || 'AED',
    });
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
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
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
              >
                {terminationTypes.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.name} | {type.nameAr}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Joining Date | <span dir="rtl">تاريخ الالتحاق</span>
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
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
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
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
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
              />
            </div>

            <button
              onClick={handleCalculate}
              className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Calculate EOSB | <span dir="rtl">احسب المكافأة</span>
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
            <div className="space-y-6">
              {/* Service Duration */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Service Duration</div>
                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {result.yearsOfService} years, {result.monthsOfService} months
                </div>
                <div className="text-sm text-indigo-500">{result.daysOfService} days total</div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                  <span className="font-medium">{result.currency} {result.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Daily Rate</span>
                  <span className="font-medium">{result.currency} {result.dailyRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">First 5 Years (21 days/year)</span>
                  <span className="font-medium">{result.currency} {result.firstPeriodAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">After 5 Years (30 days/year)</span>
                  <span className="font-medium">{result.currency} {result.secondPeriodAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Gross Amount</span>
                  <span className="font-medium">{result.currency} {result.grossAmount.toFixed(2)}</span>
                </div>
                {result.resignationFactor < 1 && (
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-amber-600 dark:text-amber-400">Resignation Factor</span>
                    <span className="font-medium text-amber-600">× {(result.resignationFactor * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>

              {/* Final Amount */}
              <div className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white">
                <div className="text-sm opacity-90 mb-1">Net EOSB Amount | <span dir="rtl">صافي المكافأة</span></div>
                <div className="text-4xl font-bold">
                  {result.currency} {result.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 flex items-center justify-center gap-2">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">First 5 Years</div>
            <div className="text-lg font-semibold">21 days per year</div>
            <div className="text-sm text-slate-400" dir="rtl">21 يوم لكل سنة</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">After 5 Years</div>
            <div className="text-lg font-semibold">30 days per year</div>
            <div className="text-sm text-slate-400" dir="rtl">30 يوم لكل سنة</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">Calculation Base</div>
            <div className="text-lg font-semibold">Basic Salary</div>
            <div className="text-sm text-slate-400" dir="rtl">الراتب الأساسي</div>
          </div>
        </div>
      </div>
    </div>
  );
}
