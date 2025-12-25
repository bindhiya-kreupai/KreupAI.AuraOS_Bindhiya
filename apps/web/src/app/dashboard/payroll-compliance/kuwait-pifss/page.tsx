"use client";

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Calculator,
  FileText,
  TrendingUp,
  ArrowLeft,
  AlertCircle,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

interface ContributionResult {
  employeeId: string;
  employeeName: string;
  nationality: string;
  sector: string;
  basicSalary: number;
  socialAllowance: number;
  contributorySalary: number;
  contribution: {
    employeeShare: number;
    employerShare: number;
    totalContribution: number;
    breakdown: {
      pension: { employee: number; employer: number };
      disability: { employee: number; employer: number };
      death: { employee: number; employer: number };
      occupationalHazards: { employee: number; employer: number };
    };
  };
}

export default function KuwaitPIFSSPage() {
  const [activeTab, setActiveTab] = useState<'calculate' | 'rates' | 'schemes'>('calculate');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ContributionResult[]>([]);
  const [referenceData, setReferenceData] = useState<any>(null);
  const [totals, setTotals] = useState<any>(null);

  useEffect(() => {
    // Fetch reference data
    const fetchReferenceData = async () => {
      try {
        const response = await fetch('/api/compliance/kuwait-pifss');
        const data = await response.json();
        if (data.success) {
          setReferenceData(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch reference data:', error);
      }
    };
    fetchReferenceData();
  }, []);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      // Mock employee data
      const mockEmployees = [
        { employeeId: '1', employeeName: 'Abdullah Al-Mutairi', nationality: 'KW', sector: 'PRIVATE', basicSalary: 1200, socialAllowance: 150 },
        { employeeId: '2', employeeName: 'Noura Al-Sabah', nationality: 'KW', sector: 'GOVERNMENT', basicSalary: 1500, socialAllowance: 200 },
        { employeeId: '3', employeeName: 'Ahmed Al-Rashid', nationality: 'SA', sector: 'PRIVATE', basicSalary: 1000, socialAllowance: 0 },
      ];

      const response = await fetch('/api/compliance/kuwait-pifss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees: mockEmployees,
          month: new Date().toISOString().slice(0, 7),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.data.results);
        setTotals(data.data.totals);
      }
    } catch (error) {
      console.error('Calculation failed:', error);
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
            <Shield className="w-7 h-7 text-blue-500" />
            Kuwait PIFSS - Public Institution for Social Security
            <span className="text-sm font-normal text-slate-500 mr-2">|</span>
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">المؤسسة العامة للتأمينات الاجتماعية</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Calculate social security contributions for Kuwaiti and GCC employees
            <span className="mx-2">•</span>
            <span dir="rtl">حساب مساهمات التأمينات الاجتماعية للموظفين</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <span className="text-xl">🇰🇼</span>
          <span className="font-medium text-blue-700 dark:text-blue-400">State of Kuwait</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'calculate', label: 'Calculate Contributions', labelAr: 'حساب المساهمات', icon: Calculator },
          { id: 'rates', label: 'Contribution Rates', labelAr: 'معدلات المساهمة', icon: TrendingUp },
          { id: 'schemes', label: 'Insurance Schemes', labelAr: 'أنظمة التأمين', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
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

      {/* Calculate Tab */}
      {activeTab === 'calculate' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Calculate Monthly Contributions
              </h3>
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                {loading ? 'Calculating...' : 'Calculate'}
              </button>
            </div>

            {results.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-2 text-left">Employee</th>
                      <th className="px-4 py-2 text-left">Nationality</th>
                      <th className="px-4 py-2 text-left">Sector</th>
                      <th className="px-4 py-2 text-right">Basic</th>
                      <th className="px-4 py-2 text-right">Social All.</th>
                      <th className="px-4 py-2 text-right">Contributory</th>
                      <th className="px-4 py-2 text-right">Employee</th>
                      <th className="px-4 py-2 text-right">Employer</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.employeeId} className="border-t border-slate-200 dark:border-slate-700">
                        <td className="px-4 py-2 font-medium">{result.employeeName}</td>
                        <td className="px-4 py-2">{result.nationality}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            result.sector === 'GOVERNMENT'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          }`}>
                            {result.sector}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">KWD {result.basicSalary.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">KWD {result.socialAllowance.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">KWD {result.contributorySalary.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">KWD {result.contribution.employeeShare.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">KWD {result.contribution.employerShare.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-semibold">KWD {result.contribution.totalContribution.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {totals && (
                    <tfoot className="bg-slate-50 dark:bg-slate-900 font-semibold">
                      <tr>
                        <td colSpan={6} className="px-4 py-2">Total</td>
                        <td className="px-4 py-2 text-right">KWD {totals.totalEmployeeContribution.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">KWD {totals.totalEmployerContribution.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">KWD {totals.totalContribution.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rates Tab */}
      {activeTab === 'rates' && referenceData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Private Sector
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Employee Share:</span>
                  <span className="font-semibold">{referenceData.rates.PRIVATE.employee * 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Employer Share:</span>
                  <span className="font-semibold">{referenceData.rates.PRIVATE.employer * 100}%</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-900 dark:text-white font-medium">Total Rate:</span>
                  <span className="font-bold text-blue-600">{referenceData.rates.PRIVATE.total * 100}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Government Sector
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Employee Share:</span>
                  <span className="font-semibold">{referenceData.rates.GOVERNMENT.employee * 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Employer Share:</span>
                  <span className="font-semibold">{referenceData.rates.GOVERNMENT.employer * 100}%</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-900 dark:text-white font-medium">Total Rate:</span>
                  <span className="font-bold text-green-600">{referenceData.rates.GOVERNMENT.total * 100}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Contributory Salary Components</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Contributory salary = Basic salary + Social allowance (if applicable)
            </p>
          </div>
        </div>
      )}

      {/* Schemes Tab */}
      {activeTab === 'schemes' && referenceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {referenceData.schemes.map((scheme: any) => (
            <div key={scheme.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {scheme.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3" dir="rtl">
                {scheme.nameAr}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {scheme.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">Coverage Information</h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Kuwait PIFSS provides comprehensive social security coverage including pension, disability, death benefits, and occupational hazards insurance.
              Different rates apply for private and government sector employees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
