"use client";

import React, { useState } from 'react';
import {
  Shield,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Building,
  CreditCard,
  Users,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface ValidationResult {
  isValid: boolean;
  errors: Array<{ employeeId: string; field: string; message: string; messageAr: string }>;
  warnings: Array<{ employeeId: string; field: string; message: string; messageAr: string }>;
}

export default function WPSPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'validate' | 'agents'>('generate');
  const [payrollMonth, setPayrollMonth] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Mock WPS configuration
  const wpsConfig = {
    employerCode: 'EMP123456789',
    wpsAgentCode: 'ENBD',
    bankCode: 'EABOROAD',
  };

  // Mock employee records
  const mockRecords = [
    { id: '1', name: 'Ahmed Mohammed', labourCard: '784199012345', account: 'AE12345678901234', netSalary: 15000, status: 'valid' },
    { id: '2', name: 'Sara Ali', labourCard: '784199012346', account: 'AE12345678901235', netSalary: 12000, status: 'valid' },
    { id: '3', name: 'John Smith', labourCard: '784199012', account: 'AE12345678901236', netSalary: 18000, status: 'error' },
    { id: '4', name: 'Fatima Hassan', labourCard: '784199012348', account: 'AE12345678901237', netSalary: 10000, status: 'warning' },
  ];

  const wpsAgents = [
    { code: 'ADCB', name: 'Abu Dhabi Commercial Bank', nameAr: 'بنك أبوظبي التجاري' },
    { code: 'ADIB', name: 'Abu Dhabi Islamic Bank', nameAr: 'مصرف أبوظبي الإسلامي' },
    { code: 'CBD', name: 'Commercial Bank of Dubai', nameAr: 'بنك دبي التجاري' },
    { code: 'DIB', name: 'Dubai Islamic Bank', nameAr: 'بنك دبي الإسلامي' },
    { code: 'ENBD', name: 'Emirates NBD', nameAr: 'الإمارات دبي الوطني' },
    { code: 'FAB', name: 'First Abu Dhabi Bank', nameAr: 'بنك أبوظبي الأول' },
    { code: 'MASHREQ', name: 'Mashreq Bank', nameAr: 'بنك المشرق' },
    { code: 'RAK', name: 'RAK Bank', nameAr: 'بنك رأس الخيمة الوطني' },
  ];

  const handleValidate = () => {
    // Mock validation
    setValidationResult({
      isValid: false,
      errors: [
        { employeeId: '3', field: 'labourCardNumber', message: 'Labour card must be 12 characters', messageAr: 'يجب أن يكون رقم بطاقة العمل 12 حرفًا' },
      ],
      warnings: [
        { employeeId: '4', field: 'leaveSalary', message: 'Leave salary exceeds net salary', messageAr: 'راتب الإجازة يتجاوز صافي الراتب' },
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
            <Shield className="w-7 h-7 text-emerald-500" />
            WPS - Wage Protection System
            <span className="text-sm font-normal text-slate-500 mr-2">|</span>
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">نظام حماية الأجور</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate SIF files for UAE Ministry of Labour compliance
            <span className="mx-2">•</span>
            <span dir="rtl">إنشاء ملفات SIF لامتثال وزارة العمل الإماراتية</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <span className="text-xl">🇦🇪</span>
          <span className="font-medium text-emerald-700 dark:text-emerald-400">United Arab Emirates</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'generate', label: 'Generate SIF', labelAr: 'إنشاء SIF', icon: FileText },
          { id: 'validate', label: 'Validate Records', labelAr: 'التحقق من السجلات', icon: CheckCircle },
          { id: 'agents', label: 'WPS Agents', labelAr: 'وكلاء WPS', icon: Building },
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
              WPS Configuration
              <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">إعدادات WPS</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Employer Code | <span dir="rtl">رمز صاحب العمل</span>
                </label>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono">
                  {wpsConfig.employerCode}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  WPS Agent | <span dir="rtl">وكيل WPS</span>
                </label>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {wpsConfig.wpsAgentCode} - Emirates NBD
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bank Code | <span dir="rtl">رمز البنك</span>
                </label>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono">
                  {wpsConfig.bankCode}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payroll Month | <span dir="rtl">شهر الرواتب</span>
                </label>
                <input
                  type="month"
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Employee Records */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
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
                    <th className="pb-3 font-medium">Labour Card</th>
                    <th className="pb-3 font-medium">Account</th>
                    <th className="pb-3 font-medium text-right">Net Salary</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3">{record.name}</td>
                      <td className="py-3 font-mono text-xs">{record.labourCard}</td>
                      <td className="py-3 font-mono text-xs">{record.account}</td>
                      <td className="py-3 text-right">AED {record.netSalary.toLocaleString()}</td>
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

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                <span className="font-medium text-slate-900 dark:text-slate-100">4</span> employees
                <span className="mx-2">•</span>
                Total: <span className="font-medium text-slate-900 dark:text-slate-100">AED 55,000</span>
              </div>
              <button className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                <Download className="w-4 h-4" />
                Generate SIF File
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'validate' && validationResult && (
        <div className="space-y-4">
          {/* Validation Summary */}
          <div className={`p-6 rounded-2xl border ${
            validationResult.isValid
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-3">
              {validationResult.isValid ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-500" />
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  {validationResult.isValid ? 'All Records Valid' : 'Validation Failed'}
                </h3>
                <p className="text-sm opacity-75">
                  {validationResult.errors.length} errors, {validationResult.warnings.length} warnings
                </p>
              </div>
            </div>
          </div>

          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-800 p-6">
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Errors ({validationResult.errors.length})
              </h3>
              <div className="space-y-3">
                {validationResult.errors.map((error, index) => (
                  <div key={index} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <div className="font-medium">Employee #{error.employeeId} - {error.field}</div>
                    <div className="text-sm text-red-700 dark:text-red-400">{error.message}</div>
                    <div className="text-sm text-red-600 dark:text-red-500 mt-1" dir="rtl">{error.messageAr}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
              <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Warnings ({validationResult.warnings.length})
              </h3>
              <div className="space-y-3">
                {validationResult.warnings.map((warning, index) => (
                  <div key={index} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <div className="font-medium">Employee #{warning.employeeId} - {warning.field}</div>
                    <div className="text-sm text-amber-700 dark:text-amber-400">{warning.message}</div>
                    <div className="text-sm text-amber-600 dark:text-amber-500 mt-1" dir="rtl">{warning.messageAr}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
            WPS Agents
            <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">وكلاء نظام حماية الأجور</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {wpsAgents.map((agent) => (
              <div
                key={agent.code}
                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="font-mono text-sm text-indigo-600 dark:text-indigo-400 mb-1">{agent.code}</div>
                <div className="font-medium text-slate-900 dark:text-slate-100">{agent.name}</div>
                <div className="text-sm text-slate-500" dir="rtl">{agent.nameAr}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
