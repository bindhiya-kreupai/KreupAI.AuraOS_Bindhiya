'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, Users, Shield, AlertTriangle, Info, RefreshCw, Building2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// GOSI Rate Constants (mirrors gosi-service.ts)
// ---------------------------------------------------------------------------

const GOSI_SALARY_CAP = 45000;

const SAUDI_RATES = {
  EMPLOYEE_PENSION: 0.0975,
  EMPLOYER_PENSION: 0.0975,
  EMPLOYEE_SANED: 0.0075,
  EMPLOYER_SANED: 0.0075,
  EMPLOYER_HAZARDS: 0.02,
};

const NON_SAUDI_RATES = {
  EMPLOYEE_SANED: 0.02,
  EMPLOYER_SANED: 0.02,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContributionResult {
  grossSalary: number;
  cappedSalary: number;
  isCapped: boolean;

  employee: {
    pension: number;
    saned: number;
    total: number;
    effectiveRate: number;
  };
  employer: {
    pension: number;
    saned: number;
    hazards: number;
    total: number;
    effectiveRate: number;
  };
  grandTotal: number;
  netTakeHome: number;
}

// ---------------------------------------------------------------------------
// Calculator Logic
// ---------------------------------------------------------------------------

function calcGosi(basic: number, housing: number, isSaudi: boolean): ContributionResult {
  const gross = basic + housing;
  const capped = Math.min(gross, GOSI_SALARY_CAP);
  const isCapped = gross > GOSI_SALARY_CAP;

  let empPension = 0;
  let empSaned = 0;
  let erPension = 0;
  let erSaned = 0;
  let erHazards = 0;

  if (isSaudi) {
    empPension = Math.round(capped * SAUDI_RATES.EMPLOYEE_PENSION * 100) / 100;
    empSaned = Math.round(capped * SAUDI_RATES.EMPLOYEE_SANED * 100) / 100;
    erPension = Math.round(capped * SAUDI_RATES.EMPLOYER_PENSION * 100) / 100;
    erSaned = Math.round(capped * SAUDI_RATES.EMPLOYER_SANED * 100) / 100;
    erHazards = Math.round(capped * SAUDI_RATES.EMPLOYER_HAZARDS * 100) / 100;
  } else {
    empSaned = Math.round(capped * NON_SAUDI_RATES.EMPLOYEE_SANED * 100) / 100;
    erSaned = Math.round(capped * NON_SAUDI_RATES.EMPLOYER_SANED * 100) / 100;
  }

  const totalEmployee = empPension + empSaned;
  const totalEmployer = erPension + erSaned + erHazards;
  const grandTotal = totalEmployee + totalEmployer;

  return {
    grossSalary: gross,
    cappedSalary: capped,
    isCapped,
    employee: {
      pension: empPension,
      saned: empSaned,
      total: totalEmployee,
      effectiveRate: capped > 0 ? Math.round((totalEmployee / capped) * 10000) / 100 : 0,
    },
    employer: {
      pension: erPension,
      saned: erSaned,
      hazards: erHazards,
      total: totalEmployer,
      effectiveRate: capped > 0 ? Math.round((totalEmployer / capped) * 10000) / 100 : 0,
    },
    grandTotal,
    netTakeHome: basic + housing - totalEmployee,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatSAR = (n: number): string =>
  new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const formatPct = (n: number): string => `${n.toFixed(2)}%`;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function AmountInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
          SAR
        </span>
        <input
          type="number"
          min={0}
          step={100}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-12 pr-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="0.00"
        />
      </div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function ContribRow({
  label,
  amount,
  rate,
  accent,
  bold,
}: {
  label: string;
  amount: number;
  rate?: number;
  accent?: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${bold ? 'border-t border-slate-200 pt-3' : ''}`}
    >
      <div className="flex items-center gap-2">
        {accent && <div className={`h-2 w-2 rounded-full ${accent}`} />}
        <span className={`text-sm ${bold ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
          {label}
        </span>
        {rate !== undefined && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-500">
            {formatPct(rate * 100)}
          </span>
        )}
      </div>
      <span
        className={`text-sm ${bold ? 'font-bold text-slate-900' : 'font-medium text-slate-900'}`}
      >
        {formatSAR(amount)}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function GosiContributionCalculator() {
  const [basicSalary, setBasicSalary] = useState('18000');
  const [housingAllowance, setHousingAllowance] = useState('6000');
  const [isSaudi, setIsSaudi] = useState(true);

  const result = useMemo(() => {
    const basic = parseFloat(basicSalary) || 0;
    const housing = parseFloat(housingAllowance) || 0;
    return calcGosi(basic, housing, isSaudi);
  }, [basicSalary, housingAllowance, isSaudi]);

  const handleReset = () => {
    setBasicSalary('18000');
    setHousingAllowance('6000');
    setIsSaudi(true);
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-emerald-600 p-2.5">
          <Calculator className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">GOSI Contribution Calculator</h2>
          <p className="text-sm text-slate-500">Preview contributions before generating files</p>
        </div>
      </div>

      {/* Rate summary banner */}
      <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <div className="text-xs text-emerald-800 space-y-1">
            <p className="font-semibold">GOSI Contribution Rates (KSA — 2024)</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
              <p>
                Saudi — Employee: 9.75% pension + 0.75% SANED = <strong>10.50%</strong>
              </p>
              <p>
                Saudi — Employer: 9.75% pension + 0.75% SANED + 2% hazards = <strong>12.50%</strong>
              </p>
              <p>
                Non-Saudi — Employee: 2% SANED = <strong>2.00%</strong>
              </p>
              <p>
                Non-Saudi — Employer: 2% SANED = <strong>2.00%</strong>
              </p>
            </div>
            <p className="mt-1 font-medium">Salary cap: SAR 45,000/month (basic + housing)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Employee Details</p>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* Nationality Toggle */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nationality</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Saudi National', value: true },
                { label: 'Non-Saudi (Expat)', value: false },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setIsSaudi(opt.value)}
                  className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                    isSaudi === opt.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <AmountInput
            label="Basic Salary"
            value={basicSalary}
            onChange={setBasicSalary}
            hint="Monthly basic wage before allowances"
          />

          <AmountInput
            label="Housing Allowance"
            value={housingAllowance}
            onChange={setHousingAllowance}
            hint="Counted toward GOSI contribution base"
          />

          {/* Salary Cap Warning */}
          {result.isCapped && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-semibold text-amber-700">Salary Cap Applied</p>
                  <p className="text-xs text-amber-600">
                    Gross salary <strong>{formatSAR(result.grossSalary)}</strong> exceeds the SAR
                    45,000 cap. Contributions are calculated on{' '}
                    <strong>{formatSAR(result.cappedSalary)}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contribution summary inputs area */}
          <div className="rounded-lg bg-slate-50 p-3 text-xs">
            <div className="flex justify-between text-slate-600 mb-1">
              <span>Contribution Base</span>
              <span className="font-semibold">{formatSAR(result.cappedSalary)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Gross Salary</span>
              <span>{formatSAR(result.grossSalary)}</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {/* Employee card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 p-1.5">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Employee Contributions</p>
              <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {formatPct(result.employee.effectiveRate)} effective
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {isSaudi && (
                <ContribRow
                  label="Pension"
                  amount={result.employee.pension}
                  rate={SAUDI_RATES.EMPLOYEE_PENSION}
                  accent="bg-blue-500"
                />
              )}
              <ContribRow
                label={isSaudi ? 'SANED' : 'SANED (Unemployment Insurance)'}
                amount={result.employee.saned}
                rate={isSaudi ? SAUDI_RATES.EMPLOYEE_SANED : NON_SAUDI_RATES.EMPLOYEE_SANED}
                accent="bg-blue-300"
              />
              <ContribRow label="Total Deducted" amount={result.employee.total} bold />
            </div>
          </div>

          {/* Employer card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-emerald-100 p-1.5">
                <Building2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Employer Contributions</p>
              <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {formatPct(result.employer.effectiveRate)} effective
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {isSaudi && (
                <ContribRow
                  label="Pension"
                  amount={result.employer.pension}
                  rate={SAUDI_RATES.EMPLOYER_PENSION}
                  accent="bg-emerald-500"
                />
              )}
              <ContribRow
                label={isSaudi ? 'SANED' : 'SANED (Unemployment Insurance)'}
                amount={result.employer.saned}
                rate={isSaudi ? SAUDI_RATES.EMPLOYER_SANED : NON_SAUDI_RATES.EMPLOYER_SANED}
                accent="bg-emerald-300"
              />
              {isSaudi && (
                <ContribRow
                  label="Occupational Hazards"
                  amount={result.employer.hazards}
                  rate={SAUDI_RATES.EMPLOYER_HAZARDS}
                  accent="bg-amber-400"
                />
              )}
              <ContribRow label="Total Cost" amount={result.employer.total} bold />
            </div>
          </div>

          {/* Grand Total */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-700" />
                <span className="text-sm font-bold text-emerald-900">Grand Total GOSI</span>
              </div>
              <span className="text-xl font-bold text-emerald-800">
                {formatSAR(result.grandTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-emerald-200 pt-2 mt-2">
              <span className="text-xs text-emerald-700">Employee Net Take-Home</span>
              <span className="text-sm font-semibold text-emerald-900">
                {formatSAR(result.netTakeHome)}
              </span>
            </div>
          </div>

          {/* Visual proportion bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Contribution Split
            </p>
            {result.grandTotal > 0 && (
              <>
                <div className="flex h-3 overflow-hidden rounded-full">
                  <div
                    className="bg-blue-500"
                    style={{ width: `${(result.employee.total / result.grandTotal) * 100}%` }}
                  />
                  <div
                    className="bg-emerald-500"
                    style={{ width: `${(result.employer.total / result.grandTotal) * 100}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    Employee: {formatPct((result.employee.total / result.grandTotal) * 100)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    Employer: {formatPct((result.employer.total / result.grandTotal) * 100)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GosiContributionCalculator;
