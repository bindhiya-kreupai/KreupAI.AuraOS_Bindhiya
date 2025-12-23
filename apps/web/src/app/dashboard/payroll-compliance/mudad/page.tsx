"use client";

import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Users,
  ArrowLeft,
  Building,
  CreditCard,
  Upload,
  TrendingUp,
  Info,
  Banknote,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface MudadRecord {
  id: string;
  nameEn: string;
  nameAr: string;
  nationalId?: string;
  iqamaNumber?: string;
  isSaudi: boolean;
  bankIBAN: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  deductions: number;
  netSalary: number;
  workDays: number;
  absentDays: number;
  status: 'valid' | 'error' | 'warning';
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{ employeeId: string; field: string; message: string; messageAr: string }>;
  warnings: Array<{ employeeId: string; field: string; message: string; messageAr: string }>;
}

// Saudi Banks
const SAUDI_BANKS = [
  { code: '10', name: 'Saudi National Bank (SNB)', nameAr: 'البنك الأهلي السعودي' },
  { code: '20', name: 'Riyad Bank', nameAr: 'بنك الرياض' },
  { code: '30', name: 'Saudi British Bank (SABB)', nameAr: 'البنك السعودي البريطاني' },
  { code: '40', name: 'Banque Saudi Fransi', nameAr: 'البنك السعودي الفرنسي' },
  { code: '45', name: 'Saudi Investment Bank', nameAr: 'البنك السعودي للاستثمار' },
  { code: '55', name: 'Bank AlBilad', nameAr: 'بنك البلاد' },
  { code: '60', name: 'Alinma Bank', nameAr: 'مصرف الإنماء' },
  { code: '65', name: 'Bank AlJazira', nameAr: 'بنك الجزيرة' },
  { code: '80', name: 'Arab National Bank', nameAr: 'البنك العربي الوطني' },
  { code: '90', name: 'Al Rajhi Bank', nameAr: 'مصرف الراجحي' },
];

const MIN_SAUDI_WAGE = 4000;

export default function MudadPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'records' | 'banks'>('generate');
  const [paymentMonth, setPaymentMonth] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Mock Mudad configuration
  const mudadConfig = {
    establishmentNumber: '5000123456',
    laborOfficeCode: '1',
    molEstablishmentId: 'MOL-12345678',
    unifiedNumber: '700012345678',
    bankCode: '90',
    bankIBAN: 'SA03 8000 0000 6080 1016 7519',
  };

  // Mock employee records
  const mockRecords: MudadRecord[] = [
    {
      id: '1',
      nameEn: 'Mohammed Ahmed Al-Ali',
      nameAr: 'محمد أحمد العلي',
      nationalId: '1098765432',
      isSaudi: true,
      bankIBAN: 'SA0380000000608010167519',
      basicSalary: 8000,
      housingAllowance: 2000,
      transportAllowance: 500,
      otherAllowances: 500,
      deductions: 500,
      netSalary: 10500,
      workDays: 22,
      absentDays: 0,
      status: 'valid'
    },
    {
      id: '2',
      nameEn: 'Sara Al-Faisal',
      nameAr: 'سارة الفيصل',
      nationalId: '1087654321',
      isSaudi: true,
      bankIBAN: 'SA0310000000108010167520',
      basicSalary: 12000,
      housingAllowance: 3000,
      transportAllowance: 750,
      otherAllowances: 1250,
      deductions: 1000,
      netSalary: 16000,
      workDays: 22,
      absentDays: 0,
      status: 'valid'
    },
    {
      id: '3',
      nameEn: 'John Smith',
      nameAr: 'جون سميث',
      iqamaNumber: '2098765432',
      isSaudi: false,
      bankIBAN: 'SA0390000000608010167521',
      basicSalary: 10000,
      housingAllowance: 2500,
      transportAllowance: 500,
      otherAllowances: 1000,
      deductions: 500,
      netSalary: 13500,
      workDays: 20,
      absentDays: 2,
      status: 'valid'
    },
    {
      id: '4',
      nameEn: 'Ahmed Al-Dosari',
      nameAr: 'أحمد الدوسري',
      nationalId: '1076543210',
      isSaudi: true,
      bankIBAN: 'SA0380000000608010167522',
      basicSalary: 3500,
      housingAllowance: 875,
      transportAllowance: 350,
      otherAllowances: 0,
      deductions: 0,
      netSalary: 4725,
      workDays: 22,
      absentDays: 0,
      status: 'warning'
    },
    {
      id: '5',
      nameEn: 'Ravi Kumar',
      nameAr: 'رافي كومار',
      iqamaNumber: '2087654321',
      isSaudi: false,
      bankIBAN: '',
      basicSalary: 6000,
      housingAllowance: 1500,
      transportAllowance: 400,
      otherAllowances: 600,
      deductions: 0,
      netSalary: 8500,
      workDays: 22,
      absentDays: 0,
      status: 'error'
    },
  ];

  const saudiCount = mockRecords.filter(r => r.isSaudi).length;
  const nonSaudiCount = mockRecords.filter(r => !r.isSaudi).length;
  const totalNetSalary = mockRecords.reduce((sum, r) => sum + r.netSalary, 0);
  const averageSalary = totalNetSalary / mockRecords.length;

  const handleValidate = () => {
    setValidationResult({
      isValid: false,
      errors: [
        { employeeId: '5', field: 'bankIBAN', message: 'Bank IBAN is required for bank transfers', messageAr: 'رقم الآيبان البنكي مطلوب للتحويلات البنكية' },
      ],
      warnings: [
        { employeeId: '4', field: 'basicSalary', message: `Saudi employee salary below minimum wage (${MIN_SAUDI_WAGE} SAR)`, messageAr: `راتب الموظف السعودي أقل من الحد الأدنى (${MIN_SAUDI_WAGE} ريال)` },
      ],
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
            <FileText className="w-7 h-7 text-purple-500" />
            Mudad - Wage Protection
            <span className="text-sm font-normal text-slate-500 mr-2">|</span>
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">مدد - حماية الأجور</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate salary files for HRSD compliance
            <span className="mx-2">•</span>
            <span dir="rtl">إنشاء ملفات الرواتب لامتثال وزارة الموارد البشرية</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <span className="text-xl">🇸🇦</span>
          <span className="font-medium text-purple-700 dark:text-purple-400">Saudi Arabia</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Users className="w-4 h-4" />
            <span>Saudi Employees</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{saudiCount}</div>
          <div className="text-xs text-slate-400" dir="rtl">موظفون سعوديون</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Users className="w-4 h-4" />
            <span>Non-Saudi</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{nonSaudiCount}</div>
          <div className="text-xs text-slate-400" dir="rtl">غير سعوديين</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Banknote className="w-4 h-4" />
            <span>Total Salaries</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">SAR {totalNetSalary.toLocaleString()}</div>
          <div className="text-xs text-slate-400" dir="rtl">إجمالي الرواتب</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Average Salary</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">SAR {averageSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="text-xs text-slate-400" dir="rtl">متوسط الراتب</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'generate', label: 'Generate File', labelAr: 'إنشاء الملف', icon: FileText },
          { id: 'records', label: 'Employee Records', labelAr: 'سجلات الموظفين', icon: Users },
          { id: 'banks', label: 'Saudi Banks', labelAr: 'البنوك السعودية', icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="text-xs text-slate-400" dir="rtl">{tab.labelAr}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Mudad Configuration
              <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">إعدادات مدد</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Establishment Number | <span dir="rtl">رقم المنشأة</span>
                </label>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono">
                  {mudadConfig.establishmentNumber}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  MOL Establishment ID | <span dir="rtl">معرف وزارة العمل</span>
                </label>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono">
                  {mudadConfig.molEstablishmentId}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Unified Number | <span dir="rtl">الرقم الموحد</span>
                </label>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono">
                  {mudadConfig.unifiedNumber}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Company Bank IBAN | <span dir="rtl">آيبان البنك</span>
                </label>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono text-sm">
                  {mudadConfig.bankIBAN}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Month | <span dir="rtl">شهر الدفع</span>
                </label>
                <input
                  type="month"
                  value={paymentMonth}
                  onChange={(e) => setPaymentMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                  <Download className="w-5 h-5" />
                  Generate Mudad File
                </button>
                <p className="text-xs text-center text-slate-400 mt-2">
                  Generates XML file for HRSD portal submission
                </p>
              </div>
            </div>
          </div>

          {/* File Preview / Summary */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Submission Summary
              <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">ملخص الإرسال</span>
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-600 dark:text-green-400 mb-1">Saudi Employees</div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{saudiCount}</div>
                <div className="text-sm text-green-600 mt-1">
                  SAR {mockRecords.filter(r => r.isSaudi).reduce((s, r) => s + r.netSalary, 0).toLocaleString()}
                </div>
                <div className="text-xs text-green-500" dir="rtl">موظفون سعوديون</div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Non-Saudi Employees</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{nonSaudiCount}</div>
                <div className="text-sm text-blue-600 mt-1">
                  SAR {mockRecords.filter(r => !r.isSaudi).reduce((s, r) => s + r.netSalary, 0).toLocaleString()}
                </div>
                <div className="text-xs text-blue-500" dir="rtl">غير سعوديين</div>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Salary Components | <span dir="rtl">مكونات الراتب</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <span>Total Basic Salary</span>
                    <span className="block text-xs text-slate-400" dir="rtl">إجمالي الراتب الأساسي</span>
                  </div>
                  <span className="font-semibold">SAR {mockRecords.reduce((s, r) => s + r.basicSalary, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <span>Total Housing Allowance</span>
                    <span className="block text-xs text-slate-400" dir="rtl">إجمالي بدل السكن</span>
                  </div>
                  <span className="font-semibold">SAR {mockRecords.reduce((s, r) => s + r.housingAllowance, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <span>Total Transport Allowance</span>
                    <span className="block text-xs text-slate-400" dir="rtl">إجمالي بدل النقل</span>
                  </div>
                  <span className="font-semibold">SAR {mockRecords.reduce((s, r) => s + r.transportAllowance, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <span>Total Other Allowances</span>
                    <span className="block text-xs text-slate-400" dir="rtl">إجمالي البدلات الأخرى</span>
                  </div>
                  <span className="font-semibold">SAR {mockRecords.reduce((s, r) => s + r.otherAllowances, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <span>Total Deductions</span>
                    <span className="block text-xs text-slate-400" dir="rtl">إجمالي الخصومات</span>
                  </div>
                  <span className="font-semibold text-red-600">- SAR {mockRecords.reduce((s, r) => s + r.deductions, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="font-semibold">
                    <span>Total Net Salaries</span>
                    <span className="block text-xs text-slate-400 font-normal" dir="rtl">إجمالي صافي الرواتب</span>
                  </div>
                  <span className="text-xl font-bold text-purple-700 dark:text-purple-300">SAR {totalNetSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700">
                <FileText className="w-4 h-4" />
                Export XML
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700">
                <FileText className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Employee Records
              <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">سجلات الموظفين</span>
            </h2>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={handleValidate}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600"
              >
                <CheckCircle className="w-4 h-4" />
                Validate
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium text-center">Saudi</th>
                  <th className="pb-3 font-medium text-right">Basic</th>
                  <th className="pb-3 font-medium text-right">Allowances</th>
                  <th className="pb-3 font-medium text-right">Deductions</th>
                  <th className="pb-3 font-medium text-right">Net Salary</th>
                  <th className="pb-3 font-medium text-center">Days</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3">
                      <div>{record.nameEn}</div>
                      <div className="text-xs text-slate-400" dir="rtl">{record.nameAr}</div>
                    </td>
                    <td className="py-3 font-mono text-xs">
                      {record.isSaudi ? record.nationalId : record.iqamaNumber}
                    </td>
                    <td className="py-3 text-center">
                      {record.isSaudi ? (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">Yes</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">No</span>
                      )}
                    </td>
                    <td className="py-3 text-right">SAR {record.basicSalary.toLocaleString()}</td>
                    <td className="py-3 text-right text-green-600">
                      +{(record.housingAllowance + record.transportAllowance + record.otherAllowances).toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-red-600">
                      {record.deductions > 0 ? `-${record.deductions.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 text-right font-semibold">SAR {record.netSalary.toLocaleString()}</td>
                    <td className="py-3 text-center">
                      <span className="text-xs">{record.workDays}/{record.workDays + record.absentDays}</span>
                    </td>
                    <td className="py-3 text-center">
                      {record.status === 'valid' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3" /> Valid
                        </span>
                      )}
                      {record.status === 'error' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs">
                          <AlertCircle className="w-3 h-3" /> Error
                        </span>
                      )}
                      {record.status === 'warning' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs">
                          <AlertTriangle className="w-3 h-3" /> Warning
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="mt-6 space-y-4">
              {validationResult.errors.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Errors ({validationResult.errors.length})
                  </h3>
                  {validationResult.errors.map((error, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">Employee #{error.employeeId}:</span> {error.message}
                      <span className="block text-xs text-red-500 mt-0.5" dir="rtl">{error.messageAr}</span>
                    </div>
                  ))}
                </div>
              )}
              {validationResult.warnings.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Warnings ({validationResult.warnings.length})
                  </h3>
                  {validationResult.warnings.map((warning, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">Employee #{warning.employeeId}:</span> {warning.message}
                      <span className="block text-xs text-amber-500 mt-0.5" dir="rtl">{warning.messageAr}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              <span className="font-medium text-slate-900 dark:text-slate-100">{mockRecords.length}</span> employees
              <span className="mx-2">•</span>
              Total: <span className="font-medium text-slate-900 dark:text-slate-100">SAR {totalNetSalary.toLocaleString()}</span>
            </div>
            <button className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
              <Download className="w-4 h-4" />
              Generate Mudad File
            </button>
          </div>
        </div>
      )}

      {activeTab === 'banks' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Saudi Banks for Mudad
              <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">البنوك السعودية لنظام مدد</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAUDI_BANKS.map((bank) => (
                <div
                  key={bank.code}
                  className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="font-mono text-lg text-indigo-600 dark:text-indigo-400">{bank.code}</div>
                  </div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{bank.name}</div>
                  <div className="text-sm text-slate-500" dir="rtl">{bank.nameAr}</div>
                </div>
              ))}
            </div>
          </div>

          {/* IBAN Information */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
            <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Saudi IBAN Format
              <span className="text-sm font-normal" dir="rtl">| صيغة الآيبان السعودي</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="font-mono text-lg bg-white dark:bg-slate-800 px-4 py-2 rounded-lg">
                  SA<span className="text-blue-600">XX</span><span className="text-green-600">XXXX</span><span className="text-amber-600">XXXXXXXXXXXXXXXXXXXX</span>
                </div>
              </div>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-20 font-mono text-blue-600">SA + 2</span>
                  <span>Country code + Check digits</span>
                  <span className="text-xs text-amber-500" dir="rtl">رمز الدولة + أرقام التحقق</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-20 font-mono text-green-600">4 digits</span>
                  <span>Bank code</span>
                  <span className="text-xs text-amber-500" dir="rtl">رمز البنك</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-20 font-mono text-amber-600">18 chars</span>
                  <span>Account number (BBAN)</span>
                  <span className="text-xs text-amber-500" dir="rtl">رقم الحساب</span>
                </li>
              </ul>
              <p className="text-xs text-amber-600 pt-2 border-t border-amber-200 dark:border-amber-700">
                Total length: 24 characters | All bank transfers must use valid Saudi IBANs
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
