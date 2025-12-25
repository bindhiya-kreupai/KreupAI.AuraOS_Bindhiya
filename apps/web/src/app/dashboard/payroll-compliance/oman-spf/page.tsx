"use client";

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Calculator,
  FileText,
  TrendingUp,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface ContributionResult {
  employeeId: string;
  employeeName: string;
  nationality: string;
  basicSalary: number;
  housingAllowance: number;
  contributorySalary: number;
  contribution: {
    employeeShare: number;
    employerShare: number;
    totalContribution: number;
    breakdown: {
      pension: { employee: number; employer: number };
      unemployment: { employee: number; employer: number };
    };
  };
}

export default function OmanSPFPage() {
  const [activeTab, setActiveTab] = useState<'calculate' | 'rates' | 'legislation'>('calculate');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ContributionResult[]>([]);
  const [referenceData, setReferenceData] = useState<any>(null);
  const [totals, setTotals] = useState<any>(null);

  useEffect(() => {
    // Fetch reference data
    const fetchReferenceData = async () => {
      try {
        const response = await fetch('/api/compliance/oman-spf');
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

  const handleCalculate = async () => {
    setLoading(true);
    try {
      // Mock employee data
      const mockEmployees = [
        { employeeId: '1', employeeName: 'Mohammed Al-Balushi', nationality: 'OM', basicSalary: 800, housingAllowance: 200 },
        { employeeId: '2', employeeName: 'Fatima Al-Harthi', nationality: 'OM', basicSalary: 1200, housingAllowance: 300 },
        { employeeId: '3', employeeName: 'Ahmed Al-Zadjali', nationality: 'SA', basicSalary: 1500, housingAllowance: 0 },
      ];

      const response = await fetch('/api/compliance/oman-spf', {
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
            <Shield className="w-7 h-7 text-green-500" />
            Oman SPF - Social Protection Fund
            <span className="text-sm font-normal text-slate-500 mr-2">|</span>
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">صندوق الحماية الاجتماعية</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Calculate social protection contributions under Royal Decree No. 52/2023
            <span className="mx-2">•</span>
            <span dir="rtl">حساب مساهمات الحماية الاجتماعية بموجب المرسوم السلطاني رقم 52/2023</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <span className="text-xl">🇴🇲</span>
          <span className="font-medium text-green-700 dark:text-green-400">Sultanate of Oman</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'calculate', label: 'Calculate Contributions', labelAr: 'حساب المساهمات', icon: Calculator },
          { id: 'rates', label: 'Contribution Rates', labelAr: 'معدلات المساهمة', icon: TrendingUp },
          { id: 'legislation', label: 'Legislation', labelAr: 'التشريع', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-600 dark:text-green-400'
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
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
                      <th className="px-4 py-2 text-right">Basic</th>
                      <th className="px-4 py-2 text-right">Housing</th>
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
                        <td className="px-4 py-2 text-right">OMR {result.basicSalary.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">OMR {result.housingAllowance.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">OMR {result.contributorySalary.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">OMR {result.contribution.employeeShare.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">OMR {result.contribution.employerShare.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-semibold">OMR {result.contribution.totalContribution.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {totals && (
                    <tfoot className="bg-slate-50 dark:bg-slate-900 font-semibold">
                      <tr>
                        <td colSpan={5} className="px-4 py-2">Total</td>
                        <td className="px-4 py-2 text-right">OMR {totals.totalEmployeeContribution.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">OMR {totals.totalEmployerContribution.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">OMR {totals.totalContribution.toFixed(2)}</td>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Omani Nationals
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Employee Share:</span>
                <span className="font-semibold">{referenceData.rates.OMANI.employee * 100}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Employer Share:</span>
                <span className="font-semibold">{referenceData.rates.OMANI.employer * 100}%</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-900 dark:text-white font-medium">Total Rate:</span>
                <span className="font-bold text-green-600">{referenceData.rates.OMANI.total * 100}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              GCC Nationals
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Employee Share:</span>
                <span className="font-semibold">{referenceData.rates.GCC.employee * 100}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Employer Share:</span>
                <span className="font-semibold">{referenceData.rates.GCC.employer * 100}%</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-900 dark:text-white font-medium">Total Rate:</span>
                <span className="font-bold text-green-600">{referenceData.rates.GCC.total * 100}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legislation Tab */}
      {activeTab === 'legislation' && referenceData && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {referenceData.legislation.name}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4" dir="rtl">
            {referenceData.legislation.nameAr}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Effective Date:</span>
              <span className="font-medium">{new Date(referenceData.legislation.effectiveDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Description:</span>
              <span className="font-medium">{referenceData.legislation.description}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {referenceData.schemes.map((scheme: any) => (
              <div key={scheme.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {scheme.name}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2" dir="rtl">
                  {scheme.nameAr}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {scheme.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">Coverage Information</h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Oman SPF covers pension and unemployment insurance for Omani and GCC nationals. Contributory salary includes basic salary and housing allowance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
