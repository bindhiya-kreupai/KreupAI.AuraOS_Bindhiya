"use client";

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Download,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Users,
  ArrowLeft,
  Calculator,
  FileText,
  TrendingUp,
  Info,
  PieChart,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface GOSIRecord {
  id: string;
  name: string;
  nationalId: string;
  iqamaNumber?: string;
  isSaudi: boolean;
  basicSalary: number;
  housingAllowance: number;
  contributableSalary: number;
  employeeContribution: number;
  employerContribution: number;
  status: 'valid' | 'error' | 'warning';
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{ employeeId: string; field: string; message: string; messageAr: string }>;
  warnings: Array<{ employeeId: string; field: string; message: string; messageAr: string }>;
}

interface GOSIRates {
  saudi: {
    annuity: { employee: number; employer: number; total: number };
    saned: { employee: number; employer: number; total: number };
    occupationalHazards: { employee: number; employer: number; total: number };
  };
  nonSaudi: {
    occupationalHazards: { employee: number; employer: number; total: number };
  };
}

export default function GOSIPage() {
  const [activeTab, setActiveTab] = useState<'calculate' | 'records' | 'rates'>('calculate');
  const [contributionMonth, setContributionMonth] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data from API
  const [gosiRates, setGosiRates] = useState<GOSIRates | null>(null);
  const [wageCeiling, setWageCeiling] = useState<number>(45000);
  const [minimumWage, setMinimumWage] = useState<number>(4000);
  const [records, setRecords] = useState<GOSIRecord[]>([]);

  // GOSI configuration
  const gosiConfig = {
    establishmentNumber: '5000123456',
    laborOfficeCode: '1',
    unifiedNumber: '700012345678',
  };

  // Calculator state
  const [calcBasicSalary, setCalcBasicSalary] = useState<string>('10000');
  const [calcHousingAllowance, setCalcHousingAllowance] = useState<string>('2500');
  const [calcIsSaudi, setCalcIsSaudi] = useState<boolean>(true);
  const [calcResult, setCalcResult] = useState<any>(null);

  // Fetch reference data on mount
  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Recalculate when inputs change (using API rates if available)
  useEffect(() => {
    if (gosiRates) {
      calculateContributions();
    }
  }, [calcBasicSalary, calcHousingAllowance, calcIsSaudi, gosiRates]);

  const fetchReferenceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/compliance/gosi');
      const result = await response.json();
      if (result.success) {
        setGosiRates(result.data.rates);
        setWageCeiling(result.data.wageCeiling || 45000);
        setMinimumWage(result.data.minimumWage || 4000);
      } else {
        setError(result.error || 'Failed to load GOSI reference data');
      }
    } catch (err) {
      console.error('Error fetching GOSI data:', err);
      setError('Failed to connect to GOSI service');
    } finally {
      setLoading(false);
    }
  };

  const calculateContributions = () => {
    if (!gosiRates) return;

    const basic = parseFloat(calcBasicSalary) || 0;
    const housing = parseFloat(calcHousingAllowance) || 0;
    const contributable = Math.min(basic + housing, wageCeiling);
    const rates = calcIsSaudi ? gosiRates.saudi : null;

    if (calcIsSaudi && rates) {
      const employeeAnnuity = (contributable * rates.annuity.employee) / 100;
      const employerAnnuity = (contributable * rates.annuity.employer) / 100;
      const employeeSaned = (contributable * rates.saned.employee) / 100;
      const employerSaned = (contributable * rates.saned.employer) / 100;
      const employerHazards = (contributable * rates.occupationalHazards.employer) / 100;

      setCalcResult({
        contributable,
        employeeTotal: employeeAnnuity + employeeSaned,
        employerTotal: employerAnnuity + employerSaned + employerHazards,
        breakdown: {
          annuity: { employee: employeeAnnuity, employer: employerAnnuity },
          saned: { employee: employeeSaned, employer: employerSaned },
          hazards: { employee: 0, employer: employerHazards },
        },
      });
    } else {
      const nonSaudiRates = gosiRates.nonSaudi;
      const employerHazards = (contributable * nonSaudiRates.occupationalHazards.employer) / 100;

      setCalcResult({
        contributable,
        employeeTotal: 0,
        employerTotal: employerHazards,
        breakdown: {
          annuity: { employee: 0, employer: 0 },
          saned: { employee: 0, employer: 0 },
          hazards: { employee: 0, employer: employerHazards },
        },
      });
    }
  };

  const handleCalculateAPI = async () => {
    setCalculating(true);
    try {
      const response = await fetch('/api/compliance/gosi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: gosiConfig,
          records: records.map(r => ({
            employeeId: r.id,
            employeeName: r.name,
            nationalId: r.isSaudi ? r.nationalId : undefined,
            iqamaNumber: r.isSaudi ? undefined : r.iqamaNumber,
            isSaudi: r.isSaudi,
            basicSalary: r.basicSalary,
            housingAllowance: r.housingAllowance,
          })),
          contributionMonth: contributionMonth || new Date().toISOString().slice(0, 7).replace('-', ''),
          format: 'json',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setValidationResult(result.data.validation);
      } else {
        setValidationResult({
          isValid: false,
          errors: result.errors || [{ employeeId: '-', field: 'general', message: result.error || 'Calculation failed', messageAr: result.errorAr || 'فشل الحساب' }],
          warnings: result.warnings || [],
        });
      }
    } catch (err) {
      console.error('Error calculating GOSI:', err);
      setError('Failed to calculate GOSI contributions');
    } finally {
      setCalculating(false);
    }
  };

  const saudiCount = records.filter(r => r.isSaudi).length;
  const nonSaudiCount = records.filter(r => !r.isSaudi).length;
  const totalEmployeeContribution = records.reduce((sum, r) => sum + r.employeeContribution, 0);
  const totalEmployerContribution = records.reduce((sum, r) => sum + r.employerContribution, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="ml-3 text-slate-500">Loading GOSI data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/payroll-compliance" className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Compliance
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Building2 className="w-7 h-7 text-blue-500" />
            GOSI - Social Insurance
            <span className="text-sm font-normal text-slate-500 mr-2">|</span>
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">التأمينات الاجتماعية</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Calculate contributions and generate GOSI submission files
            <span className="mx-2">•</span>
            <span dir="rtl">حساب الاشتراكات وإنشاء ملفات التأمينات الاجتماعية</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <span className="text-xl">🇸🇦</span>
          <span className="font-medium text-green-700 dark:text-green-400">Saudi Arabia</span>
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
            <TrendingUp className="w-4 h-4" />
            <span>Employee Contribution</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">SAR {totalEmployeeContribution.toLocaleString()}</div>
          <div className="text-xs text-slate-400" dir="rtl">حصة الموظف</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Employer Contribution</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">SAR {totalEmployerContribution.toLocaleString()}</div>
          <div className="text-xs text-slate-400" dir="rtl">حصة صاحب العمل</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'calculate', label: 'Calculator', labelAr: 'الحاسبة', icon: Calculator },
          { id: 'records', label: 'Employee Records', labelAr: 'سجلات الموظفين', icon: Users },
          { id: 'rates', label: 'GOSI Rates', labelAr: 'نسب التأمينات', icon: PieChart },
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
      {activeTab === 'calculate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator Input */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              GOSI Contribution Calculator
              <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">حاسبة اشتراكات التأمينات</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Employee Type | <span dir="rtl">نوع الموظف</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={calcIsSaudi}
                      onChange={() => setCalcIsSaudi(true)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span>Saudi <span dir="rtl">(سعودي)</span></span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!calcIsSaudi}
                      onChange={() => setCalcIsSaudi(false)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span>Non-Saudi <span dir="rtl">(غير سعودي)</span></span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Basic Salary (SAR) | <span dir="rtl">الراتب الأساسي</span>
                </label>
                <input
                  type="number"
                  value={calcBasicSalary}
                  onChange={(e) => setCalcBasicSalary(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Housing Allowance (SAR) | <span dir="rtl">بدل السكن</span>
                </label>
                <input
                  type="number"
                  value={calcHousingAllowance}
                  onChange={(e) => setCalcHousingAllowance(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  placeholder="2500"
                />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <Info className="w-4 h-4" />
                  <span>GOSI Wage Ceiling: SAR {wageCeiling.toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Contributions are calculated on Basic + Housing, capped at ceiling
                </p>
              </div>
            </div>
          </div>

          {/* Calculator Results */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Contribution Breakdown
              <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">تفصيل الاشتراكات</span>
            </h2>

            {calcResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Contributable Salary</div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    SAR {calcResult.contributable.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-500" dir="rtl">الراتب الخاضع للاشتراك</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="text-sm text-green-600 dark:text-green-400 mb-1">Employee Share</div>
                    <div className="text-xl font-bold text-green-700 dark:text-green-300">
                      SAR {calcResult.employeeTotal.toFixed(2)}
                    </div>
                    <div className="text-xs text-green-500" dir="rtl">حصة الموظف</div>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <div className="text-sm text-amber-600 dark:text-amber-400 mb-1">Employer Share</div>
                    <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
                      SAR {calcResult.employerTotal.toFixed(2)}
                    </div>
                    <div className="text-xs text-amber-500" dir="rtl">حصة صاحب العمل</div>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Detailed Breakdown | <span dir="rtl">التفصيل</span>
                  </h3>
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500">
                      <tr>
                        <th className="pb-2">Component</th>
                        <th className="pb-2 text-right">Employee</th>
                        <th className="pb-2 text-right">Employer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="py-2">Annuity <span className="text-xs text-slate-400" dir="rtl">(معاش)</span></td>
                        <td className="py-2 text-right">SAR {calcResult.breakdown.annuity.employee.toFixed(2)}</td>
                        <td className="py-2 text-right">SAR {calcResult.breakdown.annuity.employer.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-2">SANED <span className="text-xs text-slate-400" dir="rtl">(ساند)</span></td>
                        <td className="py-2 text-right">SAR {calcResult.breakdown.saned.employee.toFixed(2)}</td>
                        <td className="py-2 text-right">SAR {calcResult.breakdown.saned.employer.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-2">Occupational Hazards <span className="text-xs text-slate-400" dir="rtl">(أخطار مهنية)</span></td>
                        <td className="py-2 text-right">-</td>
                        <td className="py-2 text-right">SAR {calcResult.breakdown.hazards.employer.toFixed(2)}</td>
                      </tr>
                    </tbody>
                    <tfoot className="font-semibold border-t border-slate-200 dark:border-slate-700">
                      <tr>
                        <td className="pt-2">Total</td>
                        <td className="pt-2 text-right">SAR {calcResult.employeeTotal.toFixed(2)}</td>
                        <td className="pt-2 text-right">SAR {calcResult.employerTotal.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading rates...
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="space-y-6">
          {/* Configuration */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                GOSI Configuration
                <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">إعدادات التأمينات</span>
              </h2>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Contribution Month</label>
                  <input
                    type="month"
                    value={contributionMonth}
                    onChange={(e) => setContributionMonth(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Establishment Number</div>
                <div className="font-mono text-sm">{gosiConfig.establishmentNumber}</div>
                <div className="text-xs text-slate-400" dir="rtl">رقم المنشأة</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Labour Office Code</div>
                <div className="font-mono text-sm">{gosiConfig.laborOfficeCode}</div>
                <div className="text-xs text-slate-400" dir="rtl">رمز مكتب العمل</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Unified Number</div>
                <div className="font-mono text-sm">{gosiConfig.unifiedNumber}</div>
                <div className="text-xs text-slate-400" dir="rtl">الرقم الموحد</div>
              </div>
            </div>
          </div>

          {/* Employee Records */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Employee Records
                <span className="block text-sm font-normal text-slate-500 mt-1" dir="rtl">سجلات الموظفين</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCalculateAPI}
                  disabled={calculating || records.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 disabled:opacity-50"
                >
                  {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {calculating ? 'Calculating...' : 'Validate'}
                </button>
              </div>
            </div>

            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Users className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-lg font-medium">No employee records loaded</p>
                <p className="text-sm mt-1">Import employee data to calculate GOSI contributions</p>
                <p className="text-sm mt-1" dir="rtl">استيراد بيانات الموظفين لحساب اشتراكات التأمينات</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="pb-3 font-medium">Employee</th>
                        <th className="pb-3 font-medium">ID Number</th>
                        <th className="pb-3 font-medium text-center">Saudi</th>
                        <th className="pb-3 font-medium text-right">Contributable</th>
                        <th className="pb-3 font-medium text-right">Employee</th>
                        <th className="pb-3 font-medium text-right">Employer</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {records.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3">{record.name}</td>
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
                          <td className="py-3 text-right">SAR {record.contributableSalary.toLocaleString()}</td>
                          <td className="py-3 text-right">SAR {record.employeeContribution.toLocaleString()}</td>
                          <td className="py-3 text-right">SAR {record.employerContribution.toLocaleString()}</td>
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

                {/* Summary & Export */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{records.length}</span> employees
                    <span className="mx-2">•</span>
                    Total Contribution: <span className="font-medium text-slate-900 dark:text-slate-100">SAR {(totalEmployeeContribution + totalEmployerContribution).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700">
                      <FileText className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      <Download className="w-4 h-4" />
                      Generate GOSI File
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'rates' && gosiRates && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Saudi Rates */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Saudi Employee Rates</h2>
                <p className="text-sm text-slate-500" dir="rtl">نسب الموظف السعودي</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium">Annuity (Pension)</div>
                  <div className="text-xs text-slate-500" dir="rtl">المعاش</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Employee: <span className="font-semibold">{gosiRates.saudi.annuity.employee}%</span></div>
                  <div className="text-sm">Employer: <span className="font-semibold">{gosiRates.saudi.annuity.employer}%</span></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium">SANED (Unemployment)</div>
                  <div className="text-xs text-slate-500" dir="rtl">ساند</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Employee: <span className="font-semibold">{gosiRates.saudi.saned.employee}%</span></div>
                  <div className="text-sm">Employer: <span className="font-semibold">{gosiRates.saudi.saned.employer}%</span></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium">Occupational Hazards</div>
                  <div className="text-xs text-slate-500" dir="rtl">أخطار مهنية</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Employee: <span className="font-semibold">-</span></div>
                  <div className="text-sm">Employer: <span className="font-semibold">{gosiRates.saudi.occupationalHazards.employer}%</span></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="font-semibold">Total</div>
                <div className="text-right">
                  <div className="text-sm">Employee: <span className="font-bold text-green-600">{gosiRates.saudi.annuity.employee + gosiRates.saudi.saned.employee}%</span></div>
                  <div className="text-sm">Employer: <span className="font-bold text-green-600">{gosiRates.saudi.annuity.employer + gosiRates.saudi.saned.employer + gosiRates.saudi.occupationalHazards.employer}%</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Non-Saudi Rates */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Non-Saudi Employee Rates</h2>
                <p className="text-sm text-slate-500" dir="rtl">نسب الموظف غير السعودي</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium">Annuity (Pension)</div>
                  <div className="text-xs text-slate-500" dir="rtl">المعاش</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Not applicable</div>
                  <div className="text-xs text-slate-400" dir="rtl">غير مطبق</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium">SANED (Unemployment)</div>
                  <div className="text-xs text-slate-500" dir="rtl">ساند</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Not applicable</div>
                  <div className="text-xs text-slate-400" dir="rtl">غير مطبق</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium">Occupational Hazards</div>
                  <div className="text-xs text-slate-500" dir="rtl">أخطار مهنية</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Employee: <span className="font-semibold">-</span></div>
                  <div className="text-sm">Employer: <span className="font-semibold">{gosiRates.nonSaudi.occupationalHazards.employer}%</span></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="font-semibold">Total</div>
                <div className="text-right">
                  <div className="text-sm">Employee: <span className="font-bold text-blue-600">0%</span></div>
                  <div className="text-sm">Employer: <span className="font-bold text-blue-600">{gosiRates.nonSaudi.occupationalHazards.employer}%</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="md:col-span-2 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
            <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Important GOSI Information
              <span className="text-sm font-normal" dir="rtl">| معلومات هامة عن التأمينات</span>
            </h3>
            <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <div>
                  <span>Maximum contributable wage ceiling: <strong>SAR {wageCeiling.toLocaleString()}</strong>/month</span>
                  <span className="block text-xs text-amber-600" dir="rtl">الحد الأقصى للراتب الخاضع للاشتراك: {wageCeiling.toLocaleString()} ريال</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <div>
                  <span>Minimum wage for Saudi employees: <strong>SAR {minimumWage.toLocaleString()}</strong>/month</span>
                  <span className="block text-xs text-amber-600" dir="rtl">الحد الأدنى لراتب الموظف السعودي: {minimumWage.toLocaleString()} ريال</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <div>
                  <span>Contributions are calculated on Basic Salary + Housing Allowance</span>
                  <span className="block text-xs text-amber-600" dir="rtl">تحسب الاشتراكات على الراتب الأساسي + بدل السكن</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <div>
                  <span>SANED provides unemployment insurance for Saudi employees (max 12 months)</span>
                  <span className="block text-xs text-amber-600" dir="rtl">يوفر ساند تأمين البطالة للسعوديين (بحد أقصى 12 شهر)</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
