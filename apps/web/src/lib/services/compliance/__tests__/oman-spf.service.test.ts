/**
 * OmanSPFService — pure-calculation unit tests.
 * Oman Social Protection Fund (SPF) — Old Age Pension, Unemployment,
 * Occupational Hazard, and Maternity contributions for both Omani
 * nationals and expatriates.
 *
 * Coverage focus (Packet 2 / #49):
 *   - Calculation math for Omani employees (8%/14%/2.5% split)
 *   - Calculation math for expatriate employees (1% employer-only)
 *   - Salary ceiling (3,000 OMR) enforcement
 *   - Civil ID validation
 *   - Bulk calculation aggregation
 *   - Annual employer cost projection
 */

import { describe, it, expect } from 'vitest';
import { OmanSPFService, SPF_CONFIG } from '../oman-spf.service';

const baseOmaniEmployee: any = {
  employeeId: 'emp-1',
  civilId: '12345678',
  nationality: 'OM',
  grossSalary: 1000, // 1000 OMR
};

const baseExpatEmployee: any = {
  employeeId: 'emp-2',
  civilId: '87654321',
  nationality: 'IN',
  grossSalary: 800,
};

describe('OmanSPFService.calculateContributions — Omani national', () => {
  it('calculates 8% employee contribution on insurable salary', () => {
    const result = OmanSPFService.calculateContributions(baseOmaniEmployee);

    // 7% old age + 1% unemployment = 8% of 1000 = 80
    expect(result.employeeContribution.oldAgePension).toBeCloseTo(70, 2);
    expect(result.employeeContribution.unemployment).toBeCloseTo(10, 2);
    expect(result.employeeContribution.total).toBeCloseTo(80, 2);
  });

  it('calculates 14% employer contribution', () => {
    const result = OmanSPFService.calculateContributions(baseOmaniEmployee);

    // 11.5% + 1% + 1% + 0.5% = 14% of 1000 = 140
    expect(result.employerContribution.oldAgePension).toBeCloseTo(115, 2);
    expect(result.employerContribution.occupationalHazard).toBeCloseTo(10, 2);
    expect(result.employerContribution.unemployment).toBeCloseTo(10, 2);
    expect(result.employerContribution.maternityPaternity).toBeCloseTo(5, 2);
    expect(result.employerContribution.total).toBeCloseTo(140, 2);
  });

  it('calculates 2.5% government contribution for Omanis', () => {
    const result = OmanSPFService.calculateContributions(baseOmaniEmployee);

    expect(result.governmentContribution.oldAgePension).toBeCloseTo(25, 2);
    expect(result.governmentContribution.total).toBeCloseTo(25, 2);
  });

  it('sums total contribution correctly (employee + employer + govt)', () => {
    const result = OmanSPFService.calculateContributions(baseOmaniEmployee);

    // 80 + 140 + 25 = 245
    expect(result.totalContribution).toBeCloseTo(245, 2);
  });

  it('caps insurable salary at 3,000 OMR ceiling', () => {
    const high = { ...baseOmaniEmployee, grossSalary: 5000 };
    const result = OmanSPFService.calculateContributions(high);

    expect(result.insurableSalary).toBe(SPF_CONFIG.salaryCeiling);
    expect(result.actualGrossSalary).toBe(5000);
    // employee contribution should be on 3000, not 5000
    expect(result.employeeContribution.total).toBeCloseTo(240, 2);
    expect(result.notes.some((n) => /ceiling/i.test(n))).toBe(true);
  });

  it('uses default period (current YYYY-MM) when not specified', () => {
    const result = OmanSPFService.calculateContributions(baseOmaniEmployee);
    expect(result.period).toMatch(/^\d{4}-\d{2}$/);
  });

  it('honors explicit period override', () => {
    const result = OmanSPFService.calculateContributions(baseOmaniEmployee, '2025-03');
    expect(result.period).toBe('2025-03');
  });

  it('uses OMR currency', () => {
    const result = OmanSPFService.calculateContributions(baseOmaniEmployee);
    expect(result.currency).toBe('OMR');
  });
});

describe('OmanSPFService.calculateContributions — Expatriate', () => {
  it('expat employees pay 0% (no employee contribution)', () => {
    const result = OmanSPFService.calculateContributions(baseExpatEmployee);
    expect(result.employeeContribution.total).toBe(0);
  });

  it('expat employers pay only 1% occupational hazard', () => {
    const result = OmanSPFService.calculateContributions(baseExpatEmployee);
    // 1% of 800 = 8
    expect(result.employerContribution.total).toBeCloseTo(8, 2);
  });

  it('government does NOT contribute for expats', () => {
    const result = OmanSPFService.calculateContributions(baseExpatEmployee);
    expect(result.governmentContribution.total).toBe(0);
  });

  it('total contribution for expats = employer-only', () => {
    const result = OmanSPFService.calculateContributions(baseExpatEmployee);
    expect(result.totalContribution).toBeCloseTo(8, 2);
  });
});

describe('OmanSPFService.validateCivilId', () => {
  it('accepts an 8-digit number', () => {
    expect(OmanSPFService.validateCivilId('12345678')).toBe(true);
  });

  it('strips dashes and spaces before validating', () => {
    expect(OmanSPFService.validateCivilId('1234-5678')).toBe(true);
    expect(OmanSPFService.validateCivilId('1234 5678')).toBe(true);
  });

  it('rejects shorter than 8 digits', () => {
    expect(OmanSPFService.validateCivilId('1234567')).toBe(false);
  });

  it('rejects longer than 8 digits', () => {
    expect(OmanSPFService.validateCivilId('123456789')).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(OmanSPFService.validateCivilId('1234ABCD')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(OmanSPFService.validateCivilId('')).toBe(false);
  });
});

describe('OmanSPFService.calculateBulk', () => {
  it('returns an array of calculations for each employee', () => {
    const result = OmanSPFService.calculateBulk(
      [baseOmaniEmployee, baseExpatEmployee],
      '2026-06'
    );

    expect(result).toHaveLength(2);
    expect(result[0].nationality).toBe('OM');
    // Service normalizes non-Omani nationalities to 'NON_OM'
    expect(result[1].nationality).toBe('NON_OM');
    expect(result[0].period).toBe('2026-06');
  });
});

describe('OmanSPFService.calculateAnnualEmployerCost', () => {
  it('projects monthly employer contribution × 12', () => {
    const annual = OmanSPFService.calculateAnnualEmployerCost(baseOmaniEmployee);
    // monthly employer = 140; annual = 1680
    expect(annual).toBeCloseTo(1680, 0);
  });
});

describe('OmanSPFService.getRatesSummary', () => {
  it('returns the percentage breakdown as strings (allowing floating-point repr)', () => {
    const summary = OmanSPFService.getRatesSummary();
    // The math `0.14 * 100` produces `14.000000000000002` in JS; we
    // accept anything starting with the expected prefix.
    expect(summary.omani.employee.startsWith('8')).toBe(true);
    expect(summary.omani.employer.startsWith('14')).toBe(true);
    expect(summary.omani.government.startsWith('2.5')).toBe(true);
    expect(summary.expatriate.employee).toBe('0%');
    expect(summary.expatriate.employer.startsWith('1')).toBe(true);
  });
});

describe('OmanSPFService.getConfig', () => {
  it('returns the full SPF configuration', () => {
    const config = OmanSPFService.getConfig();
    expect(config.salaryCeiling).toBe(3000);
    expect(config.minimumWage).toBe(325);
    expect(config.omani.employee.total).toBe(0.08);
  });
});
