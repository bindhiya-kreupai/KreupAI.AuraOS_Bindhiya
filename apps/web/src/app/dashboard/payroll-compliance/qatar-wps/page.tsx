"use client";

import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  ArrowLeft,
  Building,
} from 'lucide-react';
import Link from 'next/link';

interface ValidationResult {
  isValid: boolean;
  errors: Array<{ employeeId: string; field: string; message: string; messageAr: string }>;
  warnings: Array<{ employeeId: string; field: string; message: string; messageAr: string }>;
}

export default function QatarWPSPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'validate' | 'banks'>('generate');
  const [payrollMonth, setPayrollMonth] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [referenceData, setReferenceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch reference data
    const fetchReferenceData = async () => {
      try {
        const response = await fetch('/api/compliance/qatar-wps');
        const data = await response.json();
        if (data.success) {
          setReferenceData(data.data);
        }
      } catch (error) {
            console.error('Error:', error);
              }
    };
    fetchReferenceData();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Mock employee records
      const mockRecords = [
        {
          qatarId: '28512345678',
          employeeName: 'Ahmed Al-Thani',
          nationality: 'QA',
          bankName: 'Qatar National Bank',
          accountNumber: 'QA12QNBA000000000000001234567',
          basicSalary: 8000,
          allowances: 2000,
          netSalary: 10000,
        },
      ];

      const response = await fetch('/api/compliance/qatar-wps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            employerCode: 'EMP123456',
            companyName: 'Sample Company WLL',
          },
          records: mockRecords,
          payrollMonth: payrollMonth || new Date().toISOString().slice(0, 7),
          format: 'json',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setValidationResult(data.data.validation);
      }
    } catch (error) {
            console.error('Error:', error);
          } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/payroll-compliance" className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Compliance
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Shield className="w-7 h-7 text-purple-500" />
            Qatar WPS - Wage Protection System
            <span className="text-sm font-normal text-slate-500 mr-2">|</span>
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">نظام حماية الأجور</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate WPS SIF files for Qatar Ministry of Labour compliance
            <span className="mx-2">•</span>
            <span dir="rtl">إنشاء ملفات WPS لامتثال وزارة العمل القطرية</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <span className="text-xl">🇶🇦</span>
          <span className="font-medium text-purple-700 dark:text-purple-400">State of Qatar</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'generate', label: 'Generate SIF', labelAr: 'إنشاء SIF', icon: FileText },
          { id: 'validate', label: 'Validate Records', labelAr: 'التحقق من السجلات', icon: CheckCircle },
          { id: 'banks', label: 'Qatar Banks', labelAr: 'البنوك القطرية', icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
              <span className="text-sm opacity-75" dir="rtl">({tab.labelAr})</span>
            </button>
          );
        })}
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Generate WPS SIF File
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payroll Month
                </label>
                <input
                  type="month"
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {loading ? 'Generating...' : 'Generate SIF File'}
              </button>
            </div>

            {validationResult && (
              <div className="mt-6 space-y-3">
                {validationResult.isValid ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">All records validated successfully</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {validationResult.errors.map((error, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5" />
                        <span>{error.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validate Tab */}
      {activeTab === 'validate' && referenceData && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Validation Rules
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Qatar ID Length:</span>
              <span className="font-semibold">{referenceData.validationRules.qidLength} digits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Minimum Wage:</span>
              <span className="font-semibold">QAR {referenceData.validationRules.minimumWage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Max Records Per File:</span>
              <span className="font-semibold">{referenceData.validationRules.maxRecordsPerFile}</span>
            </div>
          </div>
        </div>
      )}

      {/* Banks Tab */}
      {activeTab === 'banks' && referenceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {referenceData.banks.map((bank: any) => (
            <div key={bank.code} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                {bank.name}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2" dir="rtl">
                {bank.nameAr}
              </p>
              <p className="text-xs text-slate-500">Code: {bank.code}</p>
            </div>
          ))}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">WPS Compliance</h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Qatar's WPS ensures timely salary payments through authorized banks. Minimum wage is QAR 1,000 per month.
              <span className="mx-1">•</span>
              <span dir="rtl">يضمن نظام حماية الأجور دفع الرواتب في الوقت المحدد. الحد الأدنى للأجور 1000 ريال قطري شهرياً.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
