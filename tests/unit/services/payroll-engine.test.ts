/**
 * Unit Tests — Payroll Calculation Engine
 *
 * Covers gross pay, country-specific tax & statutory deductions, overtime,
 * gratuity, net pay, and multi-currency conversion.
 *
 * @module tests/unit/services
 */

import { describe, test, expect, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Inline payroll engine helpers (tested in isolation without Prisma)
// ---------------------------------------------------------------------------

type Currency = 'USD' | 'AED' | 'SAR' | 'INR' | 'GBP';

interface Allowances {
  housing?: number;
  transport?: number;
  food?: number;
  medical?: number;
  other?: number;
}

interface PayrollInput {
  basicSalary: number;
  allowances: Allowances;
  country: 'UAE' | 'KSA' | 'INDIA' | 'US';
  currency: Currency;
  workingDays: number;
  presentDays: number;
  overtimeHours: number;
  normalHourlyRate: number;
  yearsOfService: number;
}

// Gross salary = basic + sum(allowances)
function calculateGrossSalary(input: PayrollInput): number {
  const allowanceTotal = Object.values(input.allowances).reduce<number>(
    (sum, val) => sum + (val ?? 0),
    0
  );
  return input.basicSalary + allowanceTotal;
}

// Proportional salary for partial month
function calculateProportionalSalary(gross: number, workingDays: number, presentDays: number): number {
  if (workingDays === 0) return 0;
  return (gross / workingDays) * presentDays;
}

// Overtime
function calculateOvertime(
  hours: number,
  normalHourlyRate: number,
  type: 'normal' | 'flsa'
): number {
  const multiplier = type === 'flsa' ? 1.5 : 1.25;
  return hours * normalHourlyRate * multiplier;
}

// Tax — UAE: 0%
function calculateUAETax(_taxableIncome: number): number {
  return 0;
}

// Tax — KSA: GOSI 10% employee + 2% SANED
interface GOSIContributions {
  employeeGOSI: number;   // 9.75% for Saudi, 0 for expats (simplified: 10%)
  employerGOSI: number;   // 11.75% employer (simplified: 12%)
  saned: number;          // 1% for Saudi nationals (unemployment)
}

function calculateKSAGOSI(basicSalary: number): GOSIContributions {
  const base = Math.min(basicSalary, 45_000); // GOSI cap SAR 45,000
  return {
    employeeGOSI: base * 0.10,
    employerGOSI: base * 0.12,
    saned: base * 0.01,
  };
}

// Tax — India TDS slabs (Old regime FY 2024-25)
function calculateIndiaTDS(annualIncome: number): number {
  if (annualIncome <= 250_000) return 0;
  if (annualIncome <= 500_000) return (annualIncome - 250_000) * 0.05;
  if (annualIncome <= 1_000_000) {
    return 12_500 + (annualIncome - 500_000) * 0.20;
  }
  return 112_500 + (annualIncome - 1_000_000) * 0.30;
}

// Statutory — EPF (India)
interface EPFContributions {
  employeeEPF: number;    // 12% of basic
  employerEPF: number;    // 12% of basic (3.67% EPF + 8.33% EPS)
}

function calculateEPF(basicSalary: number): EPFContributions {
  const cappedBasic = Math.min(basicSalary, 15_000); // EPF wage ceiling
  return {
    employeeEPF: cappedBasic * 0.12,
    employerEPF: cappedBasic * 0.12,
  };
}

// Statutory — ESI (India)
interface ESIContributions {
  employeeESI: number;  // 0.75%
  employerESI: number;  // 3.25%
}

function calculateESI(grossSalary: number): ESIContributions | null {
  // ESI applicable only if gross <= 21,000 INR
  if (grossSalary > 21_000) return null;
  return {
    employeeESI: grossSalary * 0.0075,
    employerESI: grossSalary * 0.0325,
  };
}

// Gratuity — UAE (Labour Law)
function calculateUAEGratuity(
  lastBasicSalary: number,
  yearsOfService: number,
  dailyRate?: number
): number {
  if (yearsOfService < 1) return 0;

  const dailySalary = dailyRate ?? lastBasicSalary / 30;

  let gratuity = 0;
  const fullYears = Math.floor(yearsOfService);

  if (fullYears <= 5) {
    gratuity = dailySalary * 21 * fullYears;
  } else {
    // First 5 years: 21 days/year; after that: 30 days/year
    gratuity = dailySalary * 21 * 5 + dailySalary * 30 * (fullYears - 5);
  }

  // UAE max: 2 years' wages
  const maxGratuity = lastBasicSalary * 24;
  return Math.min(gratuity, maxGratuity);
}

// Multi-currency conversion
const FX_RATES: Record<Currency, number> = {
  USD: 1.0,
  AED: 3.6725,
  SAR: 3.75,
  INR: 83.12,
  GBP: 0.79,
};

function convertCurrency(amount: number, from: Currency, to: Currency): number {
  const inUSD = amount / FX_RATES[from];
  return parseFloat((inUSD * FX_RATES[to]).toFixed(2));
}

// Net pay
interface NetPayResult {
  gross: number;
  deductions: number;
  net: number;
}

function calculateNetPay(gross: number, deductions: number): NetPayResult {
  return {
    gross,
    deductions,
    net: Math.max(0, gross - deductions),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Payroll Engine — Gross Salary', () => {
  test('calculates gross salary as basic + all allowances', () => {
    const input: PayrollInput = {
      basicSalary: 10_000,
      allowances: { housing: 3_000, transport: 1_000, food: 500 },
      country: 'UAE',
      currency: 'AED',
      workingDays: 26,
      presentDays: 26,
      overtimeHours: 0,
      normalHourlyRate: 0,
      yearsOfService: 3,
    };
    expect(calculateGrossSalary(input)).toBe(14_500);
  });

  test('handles zero allowances', () => {
    const input: PayrollInput = {
      basicSalary: 5_000,
      allowances: {},
      country: 'UAE',
      currency: 'AED',
      workingDays: 26,
      presentDays: 26,
      overtimeHours: 0,
      normalHourlyRate: 0,
      yearsOfService: 1,
    };
    expect(calculateGrossSalary(input)).toBe(5_000);
  });

  test('calculates proportional salary for partial month', () => {
    const gross = 30_000;
    const result = calculateProportionalSalary(gross, 26, 20);
    expect(result).toBeCloseTo(23_076.92, 1);
  });
});

describe('Payroll Engine — Tax Deductions', () => {
  test('UAE: no income tax (0%)', () => {
    expect(calculateUAETax(50_000)).toBe(0);
    expect(calculateUAETax(500_000)).toBe(0);
  });

  test('KSA: GOSI employee contribution is 10% of basic capped at SAR 45,000', () => {
    const contributions = calculateKSAGOSI(30_000);
    expect(contributions.employeeGOSI).toBe(3_000);
    expect(contributions.employerGOSI).toBe(3_600);
    expect(contributions.saned).toBe(300);
  });

  test('KSA: GOSI is capped at SAR 45,000 basic', () => {
    const contributions = calculateKSAGOSI(60_000); // above cap
    expect(contributions.employeeGOSI).toBe(4_500);
  });

  test('India TDS: no tax up to INR 2.5 lakh', () => {
    expect(calculateIndiaTDS(200_000)).toBe(0);
    expect(calculateIndiaTDS(250_000)).toBe(0);
  });

  test('India TDS: 5% on income between 2.5L and 5L', () => {
    const tax = calculateIndiaTDS(400_000);
    expect(tax).toBe((400_000 - 250_000) * 0.05);
  });

  test('India TDS: 20% slab on income between 5L and 10L', () => {
    const tax = calculateIndiaTDS(750_000);
    expect(tax).toBe(12_500 + (750_000 - 500_000) * 0.20);
  });

  test('India TDS: 30% slab above 10L', () => {
    const tax = calculateIndiaTDS(1_500_000);
    expect(tax).toBe(112_500 + (1_500_000 - 1_000_000) * 0.30);
  });
});

describe('Payroll Engine — Statutory Contributions', () => {
  test('EPF: 12% employee + 12% employer on basic capped at INR 15,000', () => {
    const epf = calculateEPF(12_000);
    expect(epf.employeeEPF).toBe(1_440);
    expect(epf.employerEPF).toBe(1_440);
  });

  test('EPF: ceiling applied at INR 15,000', () => {
    const epf = calculateEPF(25_000);
    expect(epf.employeeEPF).toBe(1_800); // 15000 * 12%
  });

  test('ESI: 0.75% employee + 3.25% employer when gross <= 21,000', () => {
    const esi = calculateESI(18_000);
    expect(esi).not.toBeNull();
    expect(esi!.employeeESI).toBe(18_000 * 0.0075);
    expect(esi!.employerESI).toBe(18_000 * 0.0325);
  });

  test('ESI: not applicable when gross > 21,000', () => {
    const esi = calculateESI(25_000);
    expect(esi).toBeNull();
  });
});

describe('Payroll Engine — Overtime Calculation', () => {
  test('overtime at 1.25x for GCC standard hours', () => {
    const ot = calculateOvertime(10, 100, 'normal');
    expect(ot).toBe(1_250);
  });

  test('overtime at 1.5x per FLSA for USA', () => {
    const ot = calculateOvertime(10, 100, 'flsa');
    expect(ot).toBe(1_500);
  });

  test('zero overtime hours returns zero', () => {
    expect(calculateOvertime(0, 150, 'normal')).toBe(0);
  });
});

describe('Payroll Engine — UAE Gratuity', () => {
  test('zero gratuity for less than 1 year of service', () => {
    expect(calculateUAEGratuity(10_000, 0.8)).toBe(0);
  });

  test('21 days per year for first 5 years', () => {
    const dailyRate = 10_000 / 30;
    const gratuity = calculateUAEGratuity(10_000, 3, dailyRate);
    expect(gratuity).toBeCloseTo(dailyRate * 21 * 3, 0);
  });

  test('30 days per year after 5 years', () => {
    const daily = 10_000 / 30;
    const gratuity = calculateUAEGratuity(10_000, 7, daily);
    const expected = daily * 21 * 5 + daily * 30 * 2;
    expect(gratuity).toBeCloseTo(expected, 0);
  });

  test('capped at 2 years wages (24 months)', () => {
    const daily = 100_000 / 30;
    const gratuity = calculateUAEGratuity(100_000, 30, daily);
    expect(gratuity).toBe(100_000 * 24);
  });
});

describe('Payroll Engine — Net Pay', () => {
  test('net pay = gross - total deductions', () => {
    const result = calculateNetPay(20_000, 3_500);
    expect(result.gross).toBe(20_000);
    expect(result.deductions).toBe(3_500);
    expect(result.net).toBe(16_500);
  });

  test('net pay never goes below zero', () => {
    const result = calculateNetPay(5_000, 6_000);
    expect(result.net).toBe(0);
  });
});

describe('Payroll Engine — Multi-Currency Conversion', () => {
  test('converts AED to USD correctly', () => {
    const usd = convertCurrency(36_725, 'AED', 'USD');
    expect(usd).toBeCloseTo(10_000, 0);
  });

  test('converts USD to INR correctly', () => {
    const inr = convertCurrency(1_000, 'USD', 'INR');
    expect(inr).toBeCloseTo(83_120, 0);
  });

  test('same-currency conversion returns same amount', () => {
    expect(convertCurrency(5_000, 'USD', 'USD')).toBe(5_000);
  });

  test('SAR to AED conversion', () => {
    const aed = convertCurrency(3_750, 'SAR', 'AED');
    expect(aed).toBeCloseTo(3_672.5, 0);
  });
});
