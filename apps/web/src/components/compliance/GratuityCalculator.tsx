'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, User, Info, Globe, Download, AlertTriangle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Jurisdiction = 'UAE' | 'KSA' | 'BH' | 'OM' | 'KW' | 'IN';
type _ContractType = 'UNLIMITED' | 'LIMITED';
type ExitReason =
  | 'RESIGNATION'
  | 'TERMINATION'
  | 'RETIREMENT'
  | 'END_OF_CONTRACT'
  | 'MUTUAL_AGREEMENT'
  | 'DEATH';

interface GratuityResult {
  jurisdiction: Jurisdiction;
  employeeName: string;
  joiningDate: string;
  exitDate: string;
  yearsOfService: number;
  monthsOfService: number;
  basicSalary: number;
  dailyRate: number;
  calculationBreakdown: {
    period: string;
    days: number;
    dailyRate: number;
    amount: number;
  }[];
  grossGratuity: number;
  cappedAt: number | null;
  finalGratuity: number;
  isEligible: boolean;
  minServiceNote: string | null;
  taxNote: string | null;
  legalReference: string;
}

// ---------------------------------------------------------------------------
// Country Configuration
// ---------------------------------------------------------------------------

const JURISDICTION_CONFIG: Record<
  Jurisdiction,
  {
    label: string;
    flag: string;
    currency: string;
    description: string;
    minServiceYears: number;
    hasContractType: boolean;
    references: string;
  }
> = {
  UAE: {
    label: 'UAE',
    flag: '🇦🇪',
    currency: 'AED',
    description: 'UAE Labour Law — Federal Decree Law No. 33/2021',
    minServiceYears: 1,
    hasContractType: false,
    references: 'Federal Decree Law No. 33 of 2021 (effective Feb 2022)',
  },
  KSA: {
    label: 'KSA / Saudi Arabia',
    flag: '🇸🇦',
    currency: 'SAR',
    description: 'Saudi Labour Law — Royal Decree M/51',
    minServiceYears: 2,
    hasContractType: false,
    references: 'Saudi Labour Law Article 84, Royal Decree M/51',
  },
  BH: {
    label: 'Bahrain',
    flag: '🇧🇭',
    currency: 'BHD',
    description: 'Bahrain Labour Law — Decree Law No. 36/2012',
    minServiceYears: 1,
    hasContractType: false,
    references: 'Bahrain Labour Law Decree No. 36/2012, Article 116',
  },
  OM: {
    label: 'Oman',
    flag: '🇴🇲',
    currency: 'OMR',
    description: 'Oman Labour Law — Royal Decree 35/2003',
    minServiceYears: 1,
    hasContractType: false,
    references: 'Oman Labour Law Article 39 — 1 month/year basic',
  },
  KW: {
    label: 'Kuwait',
    flag: '🇰🇼',
    currency: 'KWD',
    description: 'Kuwait Private Sector Labour Law No. 6/2010',
    minServiceYears: 3,
    hasContractType: false,
    references: 'Kuwait Labour Law No. 6/2010, Article 51',
  },
  IN: {
    label: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    description: 'Payment of Gratuity Act, 1972',
    minServiceYears: 5,
    hasContractType: false,
    references: 'Payment of Gratuity Act 1972, Section 4; Max exemption Rs 20 lakhs',
  },
};

// ---------------------------------------------------------------------------
// Calculation Engine
// ---------------------------------------------------------------------------

function calculateGratuity(
  jurisdiction: Jurisdiction,
  joiningDate: Date,
  exitDate: Date,
  basicSalary: number,
  daAllowance: number = 0,
  exitReason: ExitReason
): GratuityResult {
  const config = JURISDICTION_CONFIG[jurisdiction];
  const totalDays = Math.floor((exitDate.getTime() - joiningDate.getTime()) / 86400000);
  const totalYears = totalDays / 365;
  const totalMonths = Math.floor(totalYears * 12);
  const yearsOfService = Math.floor(totalYears);

  const isEligible = yearsOfService >= config.minServiceYears;
  const dailyRate = basicSalary / 30; // All GCC countries use 30-day month for gratuity

  const result: GratuityResult = {
    jurisdiction,
    employeeName: '',
    joiningDate: joiningDate.toISOString().slice(0, 10),
    exitDate: exitDate.toISOString().slice(0, 10),
    yearsOfService,
    monthsOfService: totalMonths,
    basicSalary,
    dailyRate,
    calculationBreakdown: [],
    grossGratuity: 0,
    cappedAt: null,
    finalGratuity: 0,
    isEligible,
    minServiceNote: !isEligible
      ? `Minimum ${config.minServiceYears} year(s) of service required for gratuity eligibility.`
      : null,
    taxNote: null,
    legalReference: config.references,
  };

  if (!isEligible) return { ...result, finalGratuity: 0 };

  let grossGratuity = 0;

  if (jurisdiction === 'UAE') {
    // UAE: 21 days × first 5 years + 30 days × remaining years (uncapped)
    // No cap on total gratuity as of Federal Decree Law No. 33/2021
    const first5Years = Math.min(yearsOfService, 5);
    const remaining = Math.max(0, yearsOfService - 5);

    if (first5Years > 0) {
      const amount = Math.round(dailyRate * 21 * first5Years * 100) / 100;
      result.calculationBreakdown.push({
        period: `First ${first5Years} years`,
        days: 21 * first5Years,
        dailyRate,
        amount,
      });
      grossGratuity += amount;
    }
    if (remaining > 0) {
      const amount = Math.round(dailyRate * 30 * remaining * 100) / 100;
      result.calculationBreakdown.push({
        period: `Year 6 to ${yearsOfService}`,
        days: 30 * remaining,
        dailyRate,
        amount,
      });
      grossGratuity += amount;
    }

    // Resignation deductions (if resigned before 1-3 years, get 1/3; 3-5 years: 2/3; >5: full)
    if (exitReason === 'RESIGNATION') {
      let factor = 1;
      if (yearsOfService < 3) factor = 1 / 3;
      else if (yearsOfService < 5) factor = 2 / 3;
      if (factor < 1) {
        result.taxNote = `Resignation before 5 years — gratuity reduced to ${Math.round(factor * 100)}% of calculated amount.`;
        grossGratuity = Math.round(grossGratuity * factor * 100) / 100;
      }
    }
  } else if (jurisdiction === 'KSA') {
    // KSA: 15 days × first 5 years + 1 month × remaining (Saudi Labour Law Art. 84)
    const first5Years = Math.min(yearsOfService, 5);
    const remaining = Math.max(0, yearsOfService - 5);

    if (first5Years > 0) {
      const amount = Math.round(dailyRate * 15 * first5Years * 100) / 100;
      result.calculationBreakdown.push({
        period: `First ${first5Years} years`,
        days: 15 * first5Years,
        dailyRate,
        amount,
      });
      grossGratuity += amount;
    }
    if (remaining > 0) {
      const amount = Math.round(dailyRate * 30 * remaining * 100) / 100;
      result.calculationBreakdown.push({
        period: `Year 6 to ${yearsOfService}`,
        days: 30 * remaining,
        dailyRate,
        amount,
      });
      grossGratuity += amount;
    }

    // Resignation deductions
    if (exitReason === 'RESIGNATION') {
      let factor = 1;
      if (yearsOfService < 5) factor = 1 / 3;
      else if (yearsOfService < 10) factor = 2 / 3;
      if (factor < 1) {
        result.taxNote = `Resignation — gratuity at ${Math.round(factor * 100)}% as per Saudi Labour Law.`;
        grossGratuity = Math.round(grossGratuity * factor * 100) / 100;
      }
    }
  } else if (jurisdiction === 'BH') {
    // Bahrain: 15 days × first 3 years + 1 month × remaining
    const first3Years = Math.min(yearsOfService, 3);
    const remaining = Math.max(0, yearsOfService - 3);

    if (first3Years > 0) {
      const amount = Math.round(dailyRate * 15 * first3Years * 100) / 100;
      result.calculationBreakdown.push({
        period: `First ${first3Years} years`,
        days: 15 * first3Years,
        dailyRate,
        amount,
      });
      grossGratuity += amount;
    }
    if (remaining > 0) {
      const amount = Math.round(dailyRate * 30 * remaining * 100) / 100;
      result.calculationBreakdown.push({
        period: `Year 4 to ${yearsOfService}`,
        days: 30 * remaining,
        dailyRate,
        amount,
      });
      grossGratuity += amount;
    }
  } else if (jurisdiction === 'OM') {
    // Oman: 1 month basic per year of service
    const amount = Math.round(basicSalary * yearsOfService * 100) / 100;
    result.calculationBreakdown.push({
      period: `${yearsOfService} years × 1 month`,
      days: 30 * yearsOfService,
      dailyRate,
      amount,
    });
    grossGratuity = amount;
  } else if (jurisdiction === 'KW') {
    // Kuwait: 15 days × first 5 years + 30 days × remaining (private sector)
    const first5 = Math.min(yearsOfService, 5);
    const remaining = Math.max(0, yearsOfService - 5);
    if (first5 > 0) {
      const amount = Math.round(dailyRate * 15 * first5 * 100) / 100;
      result.calculationBreakdown.push({
        period: `First ${first5} years`,
        days: 15 * first5,
        dailyRate,
        amount,
      });
      grossGratuity += amount;
    }
    if (remaining > 0) {
      const amount = Math.round(dailyRate * 30 * remaining * 100) / 100;
      result.calculationBreakdown.push({
        period: `Year 6 to ${yearsOfService}`,
        days: 30 * remaining,
        dailyRate,
        amount,
      });
      grossGratuity += amount;
    }
  } else if (jurisdiction === 'IN') {
    // India: 15 days × years of service ÷ 26 working days/month
    // Base: Basic + DA
    const gratuityBase = basicSalary + daAllowance;
    const dailyRateIndia = gratuityBase / 26; // 26 working days
    const amount = Math.round(dailyRateIndia * 15 * yearsOfService * 100) / 100;
    result.calculationBreakdown.push({
      period: `${yearsOfService} years × 15 days`,
      days: 15 * yearsOfService,
      dailyRate: dailyRateIndia,
      amount,
    });
    grossGratuity = amount;

    // India cap: Rs 20 lakhs exempt, excess taxable
    const CAP = 2000000;
    if (grossGratuity > CAP) {
      result.cappedAt = CAP;
      result.taxNote = `Gratuity exceeds Rs 20 lakhs exemption limit. Excess ₹${(grossGratuity - CAP).toFixed(0)} is taxable as per Section 10(10) of Income Tax Act.`;
    } else {
      result.taxNote =
        'Entire gratuity amount is tax-exempt under Section 10(10) of Income Tax Act, 1961.';
    }
  }

  result.grossGratuity = grossGratuity;
  result.finalGratuity =
    result.cappedAt !== null ? Math.min(grossGratuity, result.cappedAt) : grossGratuity;

  return result;
}

// ---------------------------------------------------------------------------
// Mock Employees
// ---------------------------------------------------------------------------

const MOCK_EMPLOYEES = [
  {
    id: 'emp-001',
    name: 'Ahmed Al-Rashid',
    joiningDate: '2019-06-15',
    basicSalary: 18000,
    daAllowance: 0,
    jurisdiction: 'UAE' as Jurisdiction,
  },
  {
    id: 'emp-002',
    name: 'Priya Sharma',
    joiningDate: '2016-03-01',
    basicSalary: 48000,
    daAllowance: 0,
    jurisdiction: 'IN' as Jurisdiction,
  },
  {
    id: 'emp-003',
    name: 'Mohammed Al-Hassan',
    joiningDate: '2017-09-01',
    basicSalary: 22000,
    daAllowance: 0,
    jurisdiction: 'KSA' as Jurisdiction,
  },
];

function fmt(n: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function GratuityCalculator() {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('UAE');
  const [employeeName, setEmployeeName] = useState('');
  const [joiningDate, setJoiningDate] = useState('2019-06-15');
  const [exitDate, setExitDate] = useState(new Date().toISOString().slice(0, 10));
  const [basicSalary, setBasicSalary] = useState('18000');
  const [daAllowance, setDaAllowance] = useState('0');
  const [exitReason, setExitReason] = useState<ExitReason>('RESIGNATION');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const config = JURISDICTION_CONFIG[jurisdiction];

  const result = useMemo(() => {
    if (!joiningDate || !exitDate || !basicSalary) return null;
    const joining = new Date(joiningDate);
    const exit = new Date(exitDate);
    if (exit <= joining) return null;
    return calculateGratuity(
      jurisdiction,
      joining,
      exit,
      Number(basicSalary),
      Number(daAllowance) || 0,
      exitReason
    );
  }, [jurisdiction, joiningDate, exitDate, basicSalary, daAllowance, exitReason]);

  const handleEmployeeSelect = (empId: string) => {
    setSelectedEmployee(empId);
    const emp = MOCK_EMPLOYEES.find((e) => e.id === empId);
    if (emp) {
      setEmployeeName(emp.name);
      setJoiningDate(emp.joiningDate);
      setBasicSalary(emp.basicSalary.toString());
      setDaAllowance(emp.daAllowance.toString());
      setJurisdiction(emp.jurisdiction);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gratuity / EOSB Calculator</h1>
          <p className="text-sm text-gray-500 mt-1">
            Multi-jurisdiction end of service benefit calculation — UAE, KSA, Bahrain, Oman, Kuwait,
            India
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Form */}
          <div className="space-y-4">
            {/* Quick Employee Lookup */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                <User className="w-4 h-4 inline mr-1 text-indigo-500" /> Quick Employee Lookup
              </h3>
              <select
                value={selectedEmployee}
                onChange={(e) => handleEmployeeSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- Select employee to auto-fill --</option>
                {MOCK_EMPLOYEES.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.jurisdiction})
                  </option>
                ))}
              </select>
            </div>

            {/* Calculator Inputs */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800">Calculator Inputs</h3>

              {/* Jurisdiction */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <Globe className="w-3.5 h-3.5 inline mr-1" /> Jurisdiction
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(JURISDICTION_CONFIG) as Jurisdiction[]).map((j) => (
                    <button
                      key={j}
                      onClick={() => setJurisdiction(j)}
                      className={`flex items-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-medium transition-colors ${
                        jurisdiction === j
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span>{JURISDICTION_CONFIG[j].flag}</span>
                      <span>{j}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Employee Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Enter employee name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Last Working Day
                  </label>
                  <input
                    type="date"
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Basic Salary ({config.currency}/month)
                  </label>
                  <input
                    type="number"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                {jurisdiction === 'IN' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      DA Allowance (INR/month)
                    </label>
                    <input
                      type="number"
                      value={daAllowance}
                      onChange={(e) => setDaAllowance(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Exit Reason</label>
                <select
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value as ExitReason)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="RESIGNATION">Resignation</option>
                  <option value="TERMINATION">Termination (by employer)</option>
                  <option value="RETIREMENT">Retirement</option>
                  <option value="END_OF_CONTRACT">End of Contract</option>
                  <option value="MUTUAL_AGREEMENT">Mutual Agreement</option>
                  <option value="DEATH">Death</option>
                </select>
              </div>

              {/* Legal Reference */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-600">
                  <Info className="w-3.5 h-3.5 inline mr-1" />
                  {config.description}
                  <br />
                  <span className="font-medium">Reference:</span> {config.references}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Result */}
          <div className="space-y-4">
            {result && (
              <>
                {/* Eligibility Check */}
                {!result.isEligible && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">Not Eligible</p>
                      <p className="text-xs text-red-600 mt-0.5">{result.minServiceNote}</p>
                      <p className="text-xs text-red-600">
                        Years served: {result.yearsOfService} year(s)
                      </p>
                    </div>
                  </div>
                )}

                {result.isEligible && (
                  <>
                    {/* Summary Card */}
                    <div className="bg-indigo-700 text-white rounded-xl p-5">
                      <p className="text-indigo-200 text-xs mb-1">
                        End of Service Benefit / Gratuity
                      </p>
                      <p className="text-4xl font-bold">
                        {fmt(result.finalGratuity, config.currency)}
                      </p>
                      <div className="flex gap-4 mt-3 text-sm text-indigo-200">
                        <span>
                          {result.yearsOfService}y {result.monthsOfService % 12}m service
                        </span>
                        <span>Basic: {fmt(result.basicSalary, config.currency)}/month</span>
                      </div>
                    </div>

                    {/* Breakdown Table */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800">Calculation Breakdown</p>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">
                              Period
                            </th>
                            <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">
                              Days
                            </th>
                            <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">
                              Daily Rate
                            </th>
                            <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.calculationBreakdown.map((row, i) => (
                            <tr key={i} className="border-b border-gray-50">
                              <td className="px-4 py-2.5 text-gray-700">{row.period}</td>
                              <td className="px-4 py-2.5 text-right text-gray-600">{row.days}</td>
                              <td className="px-4 py-2.5 text-right text-gray-600">
                                {row.dailyRate.toFixed(2)}
                              </td>
                              <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                                {fmt(row.amount, config.currency)}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-indigo-50 font-semibold">
                            <td colSpan={3} className="px-4 py-2.5 text-indigo-800">
                              Gross Gratuity
                            </td>
                            <td className="px-4 py-2.5 text-right text-indigo-800">
                              {fmt(result.grossGratuity, config.currency)}
                            </td>
                          </tr>
                          {result.cappedAt && (
                            <tr className="bg-yellow-50">
                              <td colSpan={3} className="px-4 py-2.5 text-yellow-700 text-xs">
                                Tax-exempt cap
                              </td>
                              <td className="px-4 py-2.5 text-right text-yellow-700 font-medium">
                                {fmt(result.cappedAt, config.currency)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Tax / Legal Notes */}
                    {result.taxNote && (
                      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700">{result.taxNote}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium hover:border-gray-300 transition-colors">
                        <Download className="w-4 h-4 text-gray-500" /> Export PDF
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {!result && (
              <div className="flex items-center justify-center h-64 bg-white border border-gray-200 rounded-xl">
                <div className="text-center text-gray-400">
                  <Calculator className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Enter employee details to calculate gratuity</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
