'use client';

import React, { useState, useEffect } from 'react';
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
  Calendar,
  Loader2,
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

interface BankInfo {
  code: string;
  name: string;
  nameAr: string;
}

export default function MudadPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'records' | 'banks'>('generate');
  const [paymentMonth, setPaymentMonth] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data from API
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [validationRules, setValidationRules] = useState<any>(null);
  const [records, setRecords] = useState<MudadRecord[]>([]);

  // Mudad configuration
  const mudadConfig = {
    establishmentNumber: '5000123456',
    laborOfficeCode: '1',
    molEstablishmentId: 'MOL-12345678',
    unifiedNumber: '700012345678',
    bankCode: '90',
    bankIBAN: 'SA03 8000 0000 6080 1016 7519',
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  const fetchReferenceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/compliance/mudad');
      const result = await response.json();
      if (result.success) {
        setBanks(result.data.banks || []);
        setValidationRules(result.data.validationRules || null);
        const sampleRecords: MudadRecord[] = [
          {
            id: 'EMP101',
            nameEn: 'Tariq Al-Mansoor',
            nameAr: 'طارق المنصور',
            nationalId: '1098765432',
            isSaudi: true,
            bankIBAN: 'SA0380000000608010167519',
            basicSalary: 12000,
            housingAllowance: 3000,
            transportAllowance: 1000,
            otherAllowances: 500,
            deductions: 0,
            netSalary: 16500,
            workDays: 30,
            absentDays: 0,
            status: 'valid',
          },
          {
            id: 'EMP102',
            nameEn: 'Sultan Al-Otaibi',
            nameAr: 'سلطان العتيبي',
            nationalId: '1087654321',
            isSaudi: true,
            bankIBAN: 'SA0380000000608010167520',
            basicSalary: 15000,
            housingAllowance: 3750,
            transportAllowance: 1200,
            otherAllowances: 800,
            deductions: 0,
            netSalary: 20750,
            workDays: 30,
            absentDays: 0,
            status: 'valid',
          },
          {
            id: 'EMP103',
            nameEn: 'Rahul Kumar',
            nameAr: 'راهول كومار',
            iqamaNumber: '2345678901',
            isSaudi: false,
            bankIBAN: 'SA0380000000608010167521',
            basicSalary: 7000,
            housingAllowance: 1750,
            transportAllowance: 500,
            otherAllowances: 250,
            deductions: 0,
            netSalary: 9500,
            workDays: 30,
            absentDays: 0,
            status: 'valid',
          },
        ];
        setRecords(result.data?.employees?.length ? result.data.employees : sampleRecords);
      } else {
        setError(result.error || 'Failed to load Mudad reference data');
      }
    } catch (err: any) {
      console.error('Error fetching Mudad data:', err);
      setError('Failed to connect to Mudad service');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (records.length === 0) {
      setValidationResult({
        isValid: false,
        errors: [
          {
            employeeId: '-',
            field: 'records',
            message: 'No employee records to validate',
            messageAr: 'لا توجد سجلات موظفين للتحقق',
          },
        ],
        warnings: [],
      });
      return;
    }

    setValidating(true);
    try {
      const mudadRecords = records.map((r) => ({
        employeeId: r.id,
        nameEn: r.nameEn,
        nameAr: r.nameAr,
        nationalId: r.isSaudi ? r.nationalId : undefined,
        iqamaNumber: r.isSaudi ? undefined : r.iqamaNumber,
        isSaudi: r.isSaudi,
        bankIBAN: r.bankIBAN,
        basicSalary: r.basicSalary,
        housingAllowance: r.housingAllowance,
        transportAllowance: r.transportAllowance,
        otherAllowances: r.otherAllowances,
        deductions: r.deductions,
        netSalary: r.netSalary,
        workDays: r.workDays,
        absentDays: r.absentDays,
      }));

      const [year, month] = (paymentMonth || new Date().toISOString().slice(0, 7)).split('-');

      const response = await fetch('/api/compliance/mudad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: mudadConfig,
          records: mudadRecords,
          paymentMonth: month,
          paymentYear: year,
          format: 'json',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setValidationResult(result.data.validation);
      } else {
        setValidationResult({
          isValid: false,
          errors: result.errors || [
            {
              employeeId: '-',
              field: 'general',
              message: result.error || 'Validation failed',
              messageAr: result.errorAr || 'فشل التحقق',
            },
          ],
          warnings: result.warnings || [],
        });
      }
    } catch (err: any) {
      console.error('Error validating Mudad records:', err);
      setError('Failed to validate records');
    } finally {
      setValidating(false);
    }
  };

  const handleGenerate = async (format: 'xml' | 'csv') => {
    if (records.length === 0) return;

    setGenerating(true);
    try {
      const mudadRecords = records.map((r) => ({
        employeeId: r.id,
        nameEn: r.nameEn,
        nameAr: r.nameAr,
        nationalId: r.isSaudi ? r.nationalId : undefined,
        iqamaNumber: r.isSaudi ? undefined : r.iqamaNumber,
        isSaudi: r.isSaudi,
        bankIBAN: r.bankIBAN,
        basicSalary: r.basicSalary,
        housingAllowance: r.housingAllowance,
        transportAllowance: r.transportAllowance,
        otherAllowances: r.otherAllowances,
        deductions: r.deductions,
        netSalary: r.netSalary,
        workDays: r.workDays,
        absentDays: r.absentDays,
      }));

      const [year, month] = (paymentMonth || new Date().toISOString().slice(0, 7)).split('-');

      const response = await fetch('/api/compliance/mudad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: mudadConfig,
          records: mudadRecords,
          paymentMonth: month,
          paymentYear: year,
          format,
        }),
      });

      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('xml') || contentType.includes('csv')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Mudad_${year}${month}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        const result = await response.json();
        if (!result.success) {
          setError(result.error || `Failed to generate ${format.toUpperCase()} file`);
        }
      }
    } catch (err: any) {
      console.error('Error generating Mudad file:', err);
      setError('Failed to generate file');
    } finally {
      setGenerating(false);
    }
  };

  const saudiCount = records.filter((r) => r.isSaudi).length;
  const nonSaudiCount = records.filter((r) => !r.isSaudi).length;
  const totalNetSalary = records.reduce((sum, r) => sum + r.netSalary, 0);
  const averageSalary = records.length > 0 ? totalNetSalary / records.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="ml-3 text-slate-500">Loading Mudad data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/payroll-compliance"
            className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Compliance
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <FileText className="w-7 h-7 text-purple-500" />
            Mudad - Wage Protection
            <span className="text-sm font-normal text-slate-500 mr-2">|</span>
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">
              مدد - حماية الأجور
            </span>
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

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Users className="w-4 h-4" />
            <span>Saudi Employees</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{saudiCount}</div>
          <div className="text-xs text-slate-400" dir="rtl">
            موظفون سعوديون
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Users className="w-4 h-4" />
            <span>Non-Saudi</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{nonSaudiCount}</div>
          <div className="text-xs text-slate-400" dir="rtl">
            غير سعوديين
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Banknote className="w-4 h-4" />
            <span>Total Salaries</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            SAR {totalNetSalary.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400" dir="rtl">
            إجمالي الرواتب
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Average Salary</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            SAR {averageSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-slate-400" dir="rtl">
            متوسط الراتب
          </div>
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
              <span className="text-xs text-slate-400" dir="rtl">
                {tab.labelAr}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Configuration */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Mudad Configuration
              <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">
                إعدادات مدد
              </span>
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

              {validationRules && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-500 space-y-1">
                  <div>Min Saudi Wage: SAR {validationRules.minSaudiWage?.toLocaleString()}</div>
                  <div>IBAN Length: {validationRules.ibanLength} chars</div>
                  <div>Max Records/File: {validationRules.maxRecordsPerFile?.toLocaleString()}</div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => handleGenerate('xml')}
                  disabled={generating || records.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  {generating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {generating ? 'Generating...' : 'Generate Mudad File'}
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
              <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">
                ملخص الإرسال
              </span>
            </h2>

            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Users className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-lg font-medium">No employee records loaded</p>
                <p className="text-sm mt-1">Import employee payslip data to generate Mudad files</p>
                <p className="text-sm mt-1" dir="rtl">
                  استيراد بيانات كشوف الرواتب لإنشاء ملفات مدد
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-sm text-green-600 dark:text-green-400 mb-1">
                      Saudi Employees
                    </div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {saudiCount}
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      SAR{' '}
                      {records
                        .filter((r) => r.isSaudi)
                        .reduce((s, r) => s + r.netSalary, 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-xs text-green-500" dir="rtl">
                      موظفون سعوديون
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                      Non-Saudi Employees
                    </div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {nonSaudiCount}
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      SAR{' '}
                      {records
                        .filter((r) => !r.isSaudi)
                        .reduce((s, r) => s + r.netSalary, 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-500" dir="rtl">
                      غير سعوديين
                    </div>
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
                        <span className="block text-xs text-slate-400" dir="rtl">
                          إجمالي الراتب الأساسي
                        </span>
                      </div>
                      <span className="font-semibold">
                        SAR {records.reduce((s, r) => s + r.basicSalary, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <span>Total Housing Allowance</span>
                        <span className="block text-xs text-slate-400" dir="rtl">
                          إجمالي بدل السكن
                        </span>
                      </div>
                      <span className="font-semibold">
                        SAR {records.reduce((s, r) => s + r.housingAllowance, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <span>Total Transport Allowance</span>
                        <span className="block text-xs text-slate-400" dir="rtl">
                          إجمالي بدل النقل
                        </span>
                      </div>
                      <span className="font-semibold">
                        SAR {records.reduce((s, r) => s + r.transportAllowance, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <span>Total Other Allowances</span>
                        <span className="block text-xs text-slate-400" dir="rtl">
                          إجمالي البدلات الأخرى
                        </span>
                      </div>
                      <span className="font-semibold">
                        SAR {records.reduce((s, r) => s + r.otherAllowances, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div>
                        <span>Total Deductions</span>
                        <span className="block text-xs text-slate-400" dir="rtl">
                          إجمالي الخصومات
                        </span>
                      </div>
                      <span className="font-semibold text-red-600">
                        - SAR {records.reduce((s, r) => s + r.deductions, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="font-semibold">
                        <span>Total Net Salaries</span>
                        <span className="block text-xs text-slate-400 font-normal" dir="rtl">
                          إجمالي صافي الرواتب
                        </span>
                      </div>
                      <span className="text-xl font-bold text-purple-700 dark:text-purple-300">
                        SAR {totalNetSalary.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Export Options */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                  <button
                    onClick={() => handleGenerate('xml')}
                    disabled={generating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" />
                    Export XML
                  </button>
                  <button
                    onClick={() => handleGenerate('csv')}
                    disabled={generating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Employee Records
              <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">
                سجلات الموظفين
              </span>
            </h2>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={handleValidate}
                disabled={validating}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 disabled:opacity-50"
              >
                {validating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {validating ? 'Validating...' : 'Validate'}
              </button>
            </div>
          </div>

          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Users className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-lg font-medium">No employee records loaded</p>
              <p className="text-sm mt-1">Import employee payslip data to validate and submit</p>
              <p className="text-sm mt-1" dir="rtl">
                استيراد بيانات كشوف الرواتب للتحقق والإرسال
              </p>
            </div>
          ) : (
            <>
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
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3">
                          <div>{record.nameEn}</div>
                          <div className="text-xs text-slate-400" dir="rtl">
                            {record.nameAr}
                          </div>
                        </td>
                        <td className="py-3 font-mono text-xs">
                          {record.isSaudi ? record.nationalId : record.iqamaNumber}
                        </td>
                        <td className="py-3 text-center">
                          {record.isSaudi ? (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">
                              No
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          SAR {record.basicSalary.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-green-600">
                          +
                          {(
                            record.housingAllowance +
                            record.transportAllowance +
                            record.otherAllowances
                          ).toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-red-600">
                          {record.deductions > 0 ? `-${record.deductions.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 text-right font-semibold">
                          SAR {record.netSalary.toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <span className="text-xs">
                            {record.workDays}/{record.workDays + record.absentDays}
                          </span>
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
                          <span className="font-medium">Employee #{error.employeeId}:</span>{' '}
                          {error.message}
                          <span className="block text-xs text-red-500 mt-0.5" dir="rtl">
                            {error.messageAr}
                          </span>
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
                          <span className="font-medium">Employee #{warning.employeeId}:</span>{' '}
                          {warning.message}
                          <span className="block text-xs text-amber-500 mt-0.5" dir="rtl">
                            {warning.messageAr}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {records.length}
                  </span>{' '}
                  employees
                  <span className="mx-2">•</span>
                  Total:{' '}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    SAR {totalNetSalary.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => handleGenerate('xml')}
                  disabled={generating}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {generating ? 'Generating...' : 'Generate Mudad File'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'banks' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Saudi Banks for Mudad
              <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">
                البنوك السعودية لنظام مدد
              </span>
            </h2>
            {banks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {banks.map((bank) => (
                  <div
                    key={bank.code}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="font-mono text-lg text-indigo-600 dark:text-indigo-400">
                        {bank.code}
                      </div>
                    </div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {bank.name}
                    </div>
                    <div className="text-sm text-slate-500" dir="rtl">
                      {bank.nameAr}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading bank data...
              </div>
            )}
          </div>

          {/* IBAN Information */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
            <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Saudi IBAN Format
              <span className="text-sm font-normal" dir="rtl">
                | صيغة الآيبان السعودي
              </span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="font-mono text-lg bg-white dark:bg-slate-800 px-4 py-2 rounded-lg">
                  SA<span className="text-blue-600">XX</span>
                  <span className="text-green-600">XXXX</span>
                  <span className="text-amber-600">XXXXXXXXXXXXXXXXXXXX</span>
                </div>
              </div>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-20 font-mono text-blue-600">SA + 2</span>
                  <span>Country code + Check digits</span>
                  <span className="text-xs text-amber-500" dir="rtl">
                    رمز الدولة + أرقام التحقق
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-20 font-mono text-green-600">4 digits</span>
                  <span>Bank code</span>
                  <span className="text-xs text-amber-500" dir="rtl">
                    رمز البنك
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-20 font-mono text-amber-600">18 chars</span>
                  <span>Account number (BBAN)</span>
                  <span className="text-xs text-amber-500" dir="rtl">
                    رقم الحساب
                  </span>
                </li>
              </ul>
              <p className="text-xs text-amber-600 pt-2 border-t border-amber-200 dark:border-amber-700">
                Total length: {validationRules?.ibanLength || 24} characters | All bank transfers
                must use valid Saudi IBANs
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
