"use client";

import React, { useState } from 'react';
import {
  FileText,
  Calculator,
  Building2,
  Shield,
  Landmark,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
  IndianRupee
} from 'lucide-react';
import Link from 'next/link';

// Tab type
type TabType = 'pf' | 'esi' | 'tds' | 'pt';

// PF Calculator State
interface PFState {
  basicSalary: string;
  dearnessAllowance: string;
  isVoluntaryHigher: boolean;
}

// ESI Calculator State
interface ESIState {
  grossSalary: string;
}

// TDS Calculator State
interface TDSState {
  annualGrossSalary: string;
  isNewRegime: boolean;
  section80C: string;
  section80D: string;
  section24B: string;
  hra: string;
}

// PT Calculator State
interface PTState {
  grossSalary: string;
  stateCode: string;
}

// Result interfaces
interface PFResult {
  contributableWage: number;
  employeeContribution: number;
  employerPFContribution: number;
  employerEPSContribution: number;
  totalEmployerContribution: number;
  adminCharges: number;
  edliCharges: number;
  totalEmployerCost: number;
}

interface ESIResult {
  isApplicable: boolean;
  contributableWage: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
}

interface TDSResult {
  regime: string;
  annualGrossSalary: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebateUnder87A: number;
  taxAfterRebate: number;
  cess: number;
  totalTax: number;
  monthlyTDS: number;
  effectiveRate: number;
}

interface PTResult {
  stateCode: string;
  stateName: string;
  monthlyTax: number;
  annualTax: number;
}

// Supported states for Professional Tax
const supportedStates = [
  { code: 'MH', name: 'Maharashtra' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'WB', name: 'West Bengal' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'TS', name: 'Telangana' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'KL', name: 'Kerala' },
  { code: 'OR', name: 'Odisha' },
  { code: 'AS', name: 'Assam' },
  { code: 'MP', name: 'Madhya Pradesh' },
];

export default function IndiaStatutoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pf');
  const [loading, setLoading] = useState(false);

  // PF State
  const [pfState, setPFState] = useState<PFState>({
    basicSalary: '',
    dearnessAllowance: '0',
    isVoluntaryHigher: false,
  });
  const [pfResult, setPFResult] = useState<PFResult | null>(null);

  // ESI State
  const [esiState, setESIState] = useState<ESIState>({
    grossSalary: '',
  });
  const [esiResult, setESIResult] = useState<ESIResult | null>(null);

  // TDS State
  const [tdsState, setTDSState] = useState<TDSState>({
    annualGrossSalary: '',
    isNewRegime: true,
    section80C: '0',
    section80D: '0',
    section24B: '0',
    hra: '0',
  });
  const [tdsResult, setTDSResult] = useState<TDSResult | null>(null);

  // PT State
  const [ptState, setPTState] = useState<PTState>({
    grossSalary: '',
    stateCode: 'MH',
  });
  const [ptResult, setPTResult] = useState<PTResult | null>(null);

  // Calculate PF
  const calculatePF = async () => {
    if (!pfState.basicSalary) return;
    setLoading(true);
    try {
      const response = await fetch('/api/india-statutory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'default',
          action: 'calculate-pf-detailed',
          basicSalary: parseFloat(pfState.basicSalary),
          dearnessAllowance: parseFloat(pfState.dearnessAllowance || '0'),
          isVoluntaryHigher: pfState.isVoluntaryHigher,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setPFResult(data.data);
      }
    } catch (error) {
            console.error('Error:', error);
          }
    setLoading(false);
  };

  // Calculate ESI
  const calculateESI = async () => {
    if (!esiState.grossSalary) return;
    setLoading(true);
    try {
      const response = await fetch('/api/india-statutory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'default',
          action: 'calculate-esi-detailed',
          grossSalary: parseFloat(esiState.grossSalary),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setESIResult(data.data);
      }
    } catch (error) {
            console.error('Error:', error);
          }
    setLoading(false);
  };

  // Calculate TDS
  const calculateTDS = async () => {
    if (!tdsState.annualGrossSalary) return;
    setLoading(true);
    try {
      const response = await fetch('/api/india-statutory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'default',
          action: 'calculate-tds-detailed',
          annualGrossSalary: parseFloat(tdsState.annualGrossSalary),
          isNewRegime: tdsState.isNewRegime,
          section80C: parseFloat(tdsState.section80C || '0'),
          section80D: parseFloat(tdsState.section80D || '0'),
          section24B: parseFloat(tdsState.section24B || '0'),
          hra: parseFloat(tdsState.hra || '0'),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setTDSResult(data.data);
      }
    } catch (error) {
            console.error('Error:', error);
          }
    setLoading(false);
  };

  // Calculate Professional Tax
  const calculatePT = async () => {
    if (!ptState.grossSalary) return;
    setLoading(true);
    try {
      const response = await fetch('/api/india-statutory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'default',
          action: 'calculate-professional-tax',
          grossSalary: parseFloat(ptState.grossSalary),
          stateCode: ptState.stateCode,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setPTResult(data.data);
      }
    } catch (error) {
            console.error('Error:', error);
          }
    setLoading(false);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Tabs
  const tabs = [
    { id: 'pf' as TabType, label: 'Provident Fund', labelHi: 'भविष्य निधि', icon: Building2, color: 'text-blue-500' },
    { id: 'esi' as TabType, label: 'ESI', labelHi: 'कर्मचारी राज्य बीमा', icon: Shield, color: 'text-green-500' },
    { id: 'tds' as TabType, label: 'TDS', labelHi: 'स्रोत पर कर कटौती', icon: Landmark, color: 'text-purple-500' },
    { id: 'pt' as TabType, label: 'Professional Tax', labelHi: 'व्यावसायिक कर', icon: FileText, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/dashboard/payroll-compliance"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <IndianRupee className="w-7 h-7 text-orange-500" />
              India Statutory Compliance
            </h1>
          </div>
          <p className="text-slate-500 text-sm ml-12">
            Calculate PF, ESI, TDS, and Professional Tax
            <span className="mx-2">•</span>
            <span>PF / ESI / TDS / PT गणना</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="text-2xl">🇮🇳</span>
          <span>India</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-orange-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-800 dark:text-orange-200">FY 2024-25 Rates Applied</h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              PF: 12% | ESI: 0.75% (Employee) + 3.25% (Employer) | New Tax Regime Default
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-orange-500' : ''}`} />
                <span>{tab.label}</span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs">{tab.labelHi}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* PF Tab */}
          {activeTab === 'pf' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-500" />
                  PF Calculator
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Basic Salary (मूल वेतन)
                  </label>
                  <input
                    type="number"
                    value={pfState.basicSalary}
                    onChange={(e) => setPFState({ ...pfState, basicSalary: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Enter basic salary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Dearness Allowance (महंगाई भत्ता)
                  </label>
                  <input
                    type="number"
                    value={pfState.dearnessAllowance}
                    onChange={(e) => setPFState({ ...pfState, dearnessAllowance: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Enter DA (optional)"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="voluntaryPF"
                    checked={pfState.isVoluntaryHigher}
                    onChange={(e) => setPFState({ ...pfState, isVoluntaryHigher: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="voluntaryPF" className="text-sm text-slate-600 dark:text-slate-400">
                    Voluntary Higher Contribution (स्वैच्छिक उच्च योगदान)
                  </label>
                </div>
                <button
                  onClick={calculatePF}
                  disabled={loading || !pfState.basicSalary}
                  className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                  Calculate PF
                </button>
              </div>

              {pfResult && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">PF Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Contributable Wage</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(pfResult.contributableWage)}</span>
                    </div>
                    <hr className="border-slate-200 dark:border-slate-700" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Employee PF (12%)</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(pfResult.employeeContribution)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Employer EPF (3.67%)</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(pfResult.employerPFContribution)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Employer EPS (8.33%)</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(pfResult.employerEPSContribution)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Admin Charges (0.5%)</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(pfResult.adminCharges)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">EDLI (0.5%)</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(pfResult.edliCharges)}</span>
                    </div>
                    <hr className="border-slate-200 dark:border-slate-700" />
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-blue-600">Total Employer Cost</span>
                      <span className="text-blue-600">{formatCurrency(pfResult.totalEmployerCost)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ESI Tab */}
          {activeTab === 'esi' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-green-500" />
                  ESI Calculator
                </h3>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm text-green-700 dark:text-green-300">
                  ESI is applicable if gross salary ≤ ₹21,000/month
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gross Salary (सकल वेतन)
                  </label>
                  <input
                    type="number"
                    value={esiState.grossSalary}
                    onChange={(e) => setESIState({ grossSalary: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Enter gross salary"
                  />
                </div>
                <button
                  onClick={calculateESI}
                  disabled={loading || !esiState.grossSalary}
                  className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                  Calculate ESI
                </button>
              </div>

              {esiResult && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    ESI Result
                    {esiResult.isApplicable ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </h4>
                  {esiResult.isApplicable ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Contributable Wage</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(esiResult.contributableWage)}</span>
                      </div>
                      <hr className="border-slate-200 dark:border-slate-700" />
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Employee (0.75%)</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(esiResult.employeeContribution)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Employer (3.25%)</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(esiResult.employerContribution)}</span>
                      </div>
                      <hr className="border-slate-200 dark:border-slate-700" />
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-green-600">Total Contribution</span>
                        <span className="text-green-600">{formatCurrency(esiResult.totalContribution)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                      <p className="text-amber-700 dark:text-amber-300 text-sm">
                        ESI not applicable - Gross salary exceeds ₹21,000 ceiling
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TDS Tab */}
          {activeTab === 'tds' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-500" />
                  TDS Calculator
                </h3>
                <div className="flex items-center gap-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={tdsState.isNewRegime}
                      onChange={() => setTDSState({ ...tdsState, isNewRegime: true })}
                      className="text-purple-500"
                    />
                    <span className="text-sm font-medium">New Regime</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!tdsState.isNewRegime}
                      onChange={() => setTDSState({ ...tdsState, isNewRegime: false })}
                      className="text-purple-500"
                    />
                    <span className="text-sm font-medium">Old Regime</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Annual Gross Salary (वार्षिक सकल वेतन)
                  </label>
                  <input
                    type="number"
                    value={tdsState.annualGrossSalary}
                    onChange={(e) => setTDSState({ ...tdsState, annualGrossSalary: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Enter annual salary"
                  />
                </div>
                {!tdsState.isNewRegime && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">80C (Max 1.5L)</label>
                        <input
                          type="number"
                          value={tdsState.section80C}
                          onChange={(e) => setTDSState({ ...tdsState, section80C: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">80D (Health)</label>
                        <input
                          type="number"
                          value={tdsState.section80D}
                          onChange={(e) => setTDSState({ ...tdsState, section80D: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">24B (Home Loan)</label>
                        <input
                          type="number"
                          value={tdsState.section24B}
                          onChange={(e) => setTDSState({ ...tdsState, section24B: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">HRA Exemption</label>
                        <input
                          type="number"
                          value={tdsState.hra}
                          onChange={(e) => setTDSState({ ...tdsState, hra: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>
                  </>
                )}
                <button
                  onClick={calculateTDS}
                  disabled={loading || !tdsState.annualGrossSalary}
                  className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                  Calculate TDS
                </button>
              </div>

              {tdsResult && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Tax Breakdown
                    <span className={`text-xs px-2 py-0.5 rounded ${tdsResult.regime === 'NEW' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-700'}`}>
                      {tdsResult.regime} Regime
                    </span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Gross Salary</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(tdsResult.annualGrossSalary)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Taxable Income</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(tdsResult.taxableIncome)}</span>
                    </div>
                    <hr className="border-slate-200 dark:border-slate-700" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Tax (Before Rebate)</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(tdsResult.taxBeforeRebate)}</span>
                    </div>
                    {tdsResult.rebateUnder87A > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Rebate u/s 87A</span>
                        <span>-{formatCurrency(tdsResult.rebateUnder87A)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Cess (4%)</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(tdsResult.cess)}</span>
                    </div>
                    <hr className="border-slate-200 dark:border-slate-700" />
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-purple-600">Total Annual Tax</span>
                      <span className="text-purple-600">{formatCurrency(tdsResult.totalTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                      <span className="text-purple-700 dark:text-purple-300">Monthly TDS</span>
                      <span className="text-purple-700 dark:text-purple-300">{formatCurrency(tdsResult.monthlyTDS)}</span>
                    </div>
                    <div className="text-center text-xs text-slate-500">
                      Effective Rate: {tdsResult.effectiveRate}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Professional Tax Tab */}
          {activeTab === 'pt' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-orange-500" />
                  Professional Tax Calculator
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    State (राज्य)
                  </label>
                  <select
                    value={ptState.stateCode}
                    onChange={(e) => setPTState({ ...ptState, stateCode: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {supportedStates.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gross Salary (सकल वेतन)
                  </label>
                  <input
                    type="number"
                    value={ptState.grossSalary}
                    onChange={(e) => setPTState({ ...ptState, grossSalary: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Enter gross salary"
                  />
                </div>
                <button
                  onClick={calculatePT}
                  disabled={loading || !ptState.grossSalary}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                  Calculate PT
                </button>
              </div>

              {ptResult && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    Professional Tax - {ptResult.stateName}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Monthly Tax</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(ptResult.monthlyTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-orange-600">Annual Tax</span>
                      <span className="text-orange-600">{formatCurrency(ptResult.annualTax)}</span>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-xs text-orange-700 dark:text-orange-300">
                      Note: Maximum PT is capped at ₹2,500/year in most states
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compliance Calendar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-500" />
          Compliance Due Dates
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-blue-600 dark:text-blue-400 font-semibold">EPF Payment</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">15th of following month</div>
            <div className="text-xs text-slate-500 mt-1">Penalty: 1% per month</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-green-600 dark:text-green-400 font-semibold">ESI Payment</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">15th of following month</div>
            <div className="text-xs text-slate-500 mt-1">Penalty: 12% per annum</div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-purple-600 dark:text-purple-400 font-semibold">TDS Payment</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">7th of following month</div>
            <div className="text-xs text-slate-500 mt-1">Penalty: 1.5% per month</div>
          </div>
        </div>
      </div>
    </div>
  );
}
