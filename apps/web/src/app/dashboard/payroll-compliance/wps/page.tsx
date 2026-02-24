"use client";

import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface WPSRecord {
  id: string;
  name: string;
  labourCard: string;
  account: string;
  netSalary: number;
  status: 'valid' | 'error' | 'warning';
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{ employeeId: string; field: string; message: string; messageAr: string }>;
  warnings: Array<{ employeeId: string; field: string; message: string; messageAr: string }>;
}

interface WPSAgent {
  code: string;
  name: string;
  nameAr?: string;
}

export default function WPSPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'validate' | 'agents'>('generate');
  const [payrollMonth, setPayrollMonth] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data from API
  const [records, setRecords] = useState<WPSRecord[]>([]);
  const [wpsAgents, setWpsAgents] = useState<WPSAgent[]>([]);
  const [validationRules, setValidationRules] = useState<any>(null);

  // WPS configuration (would come from company settings in production)
  const wpsConfig = {
    employerCode: 'EMP123456789',
    wpsAgentCode: 'ENBD',
    bankCode: 'EABOROAD',
  };

  // Fetch reference data on mount
  useEffect(() => {
    fetchReferenceData();
  }, []);

  const fetchReferenceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/compliance/wps');
      const result = await response.json();
      if (result.success) {
        setWpsAgents(result.data.agents || []);
        setValidationRules(result.data.validationRules || null);
        // Set default records from employee/payslip data
        // In a real scenario, these would come from another API (e.g., /api/payroll/employees)
        // For now, we use the reference data to set up empty records state
        setRecords([]);
      } else {
        setError(result.error || 'Failed to load WPS reference data');
      }
    } catch (err) {
      console.error('Error fetching WPS data:', err);
      setError('Failed to connect to WPS service');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (records.length === 0) {
      setValidationResult({
        isValid: false,
        errors: [{ employeeId: '-', field: 'records', message: 'No employee records to validate', messageAr: 'لا توجد سجلات موظفين للتحقق' }],
        warnings: [],
      });
      setActiveTab('validate');
      return;
    }

    setValidating(true);
    try {
      const wpsRecords = records.map(r => ({
        employeeId: r.id,
        employeeName: r.name,
        labourCardNumber: r.labourCard,
        bankAccountNumber: r.account,
        netSalary: r.netSalary,
        basicSalary: r.netSalary,
        routingCode: wpsConfig.bankCode,
      }));

      const response = await fetch('/api/compliance/wps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: wpsConfig,
          records: wpsRecords,
          payrollMonth: payrollMonth || new Date().toISOString().slice(0, 7),
          format: 'json',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setValidationResult(result.data.validation);
      } else {
        // Validation errors from the API
        setValidationResult({
          isValid: false,
          errors: result.errors || [{ employeeId: '-', field: 'general', message: result.error || 'Validation failed', messageAr: result.errorAr || 'فشل التحقق' }],
          warnings: result.warnings || [],
        });
      }
      setActiveTab('validate');
    } catch (err) {
      console.error('Error validating WPS records:', err);
      setValidationResult({
        isValid: false,
        errors: [{ employeeId: '-', field: 'general', message: 'Failed to connect to validation service', messageAr: 'فشل الاتصال بخدمة التحقق' }],
        warnings: [],
      });
      setActiveTab('validate');
    } finally {
      setValidating(false);
    }
  };

  const handleGenerateSIF = async () => {
    if (records.length === 0) return;

    setGenerating(true);
    try {
      const wpsRecords = records.map(r => ({
        employeeId: r.id,
        employeeName: r.name,
        labourCardNumber: r.labourCard,
        bankAccountNumber: r.account,
        netSalary: r.netSalary,
        basicSalary: r.netSalary,
        routingCode: wpsConfig.bankCode,
      }));

      const response = await fetch('/api/compliance/wps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: wpsConfig,
          records: wpsRecords,
          payrollMonth: payrollMonth || new Date().toISOString().slice(0, 7),
          format: 'sif',
        }),
      });

      if (response.headers.get('Content-Type')?.includes('text/plain')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `WPS_${(payrollMonth || new Date().toISOString().slice(0, 7)).replace('-', '')}.sif`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        const result = await response.json();
        if (!result.success) {
          setError(result.error || 'Failed to generate SIF file');
        }
      }
    } catch (err) {
      console.error('Error generating SIF:', err);
      setError('Failed to generate SIF file');
    } finally {
      setGenerating(false);
    }
  };

  const totalNetSalary = records.reduce((sum, r) => sum + r.netSalary, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="ml-3 text-slate-500">Loading WPS data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 text-sm">Dismiss</button>
        </div>
      )}

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
                  {wpsConfig.wpsAgentCode} - {wpsAgents.find(a => a.code === wpsConfig.wpsAgentCode)?.name || 'Emirates NBD'}
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

              {validationRules && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-500 space-y-1">
                  <div>Labour Card Length: {validationRules.labourCardLength} chars</div>
                  <div>Account Number: {validationRules.accountNumberMinLength}-{validationRules.accountNumberMaxLength} chars</div>
                  <div>Max Records/File: {validationRules.maxRecordsPerFile?.toLocaleString()}</div>
                </div>
              )}
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
                  disabled={validating}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 disabled:opacity-50"
                >
                  {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {validating ? 'Validating...' : 'Validate'}
                </button>
              </div>
            </div>

            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Users className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-lg font-medium">No employee records loaded</p>
                <p className="text-sm mt-1">Import employee payslip data to generate WPS SIF files</p>
                <p className="text-sm mt-1" dir="rtl">استيراد بيانات كشوف الرواتب لإنشاء ملفات SIF</p>
              </div>
            ) : (
              <>
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
                      {records.map((record) => (
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
                    <span className="font-medium text-slate-900 dark:text-slate-100">{records.length}</span> employees
                    <span className="mx-2">•</span>
                    Total: <span className="font-medium text-slate-900 dark:text-slate-100">AED {totalNetSalary.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={handleGenerateSIF}
                    disabled={generating || records.length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {generating ? 'Generating...' : 'Generate SIF File'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'validate' && (
        <div className="space-y-4">
          {validationResult ? (
            <>
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <CheckCircle className="w-12 h-12 mb-3 opacity-50" />
              <p>Click "Validate" on the Generate SIF tab to validate records</p>
              <p className="text-sm mt-1" dir="rtl">اضغط "تحقق" في تبويب إنشاء SIF للتحقق من السجلات</p>
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
          {wpsAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {wpsAgents.map((agent) => (
                <div
                  key={agent.code}
                  className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="font-mono text-sm text-indigo-600 dark:text-indigo-400 mb-1">{agent.code}</div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{agent.name}</div>
                  {agent.nameAr && <div className="text-sm text-slate-500" dir="rtl">{agent.nameAr}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading WPS agents...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

