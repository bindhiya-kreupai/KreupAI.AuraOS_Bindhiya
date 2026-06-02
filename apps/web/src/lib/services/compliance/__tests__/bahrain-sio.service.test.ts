/**
 * BahrainSIOService — pure-calculation unit tests.
 * Bahrain Social Insurance Organization (SIO) — Pension, Unemployment,
 * Workplace Injury contributions for Bahraini nationals + expatriates.
 */

import { describe, it, expect } from 'vitest';
import { BahrainSIOService, SIO_CONFIG } from '../bahrain-sio.service';

const baseBahraini: any = {
  employeeId: 'emp-1',
  cpr: '123456789',
  nationality: 'BH',
  grossSalary: 1000,
};

const baseExpat: any = {
  employeeId: 'emp-2',
  cpr: '987654321',
  nationality: 'IN',
  grossSalary: 800,
};

describe('BahrainSIOService.calculateContributions — Bahraini', () => {
  it('computes 9% employee (8% pension + 1% unemployment)', () => {
    const r = BahrainSIOService.calculateContributions(baseBahraini);
    expect(r.employeeContribution.total).toBeCloseTo(90, 2);
  });

  it('computes 17% employer (12% pension + 2% UI + 3% workplace)', () => {
    const r = BahrainSIOService.calculateContributions(baseBahraini);
    expect(r.employerContribution.total).toBeCloseTo(170, 2);
  });

  it('caps insurable salary at 4,000 BHD', () => {
    const high = { ...baseBahraini, grossSalary: 6000 };
    const r = BahrainSIOService.calculateContributions(high);
    expect(r.insurableSalary).toBe(SIO_CONFIG.salaryCeiling);
    expect(r.notes.some((n: string) => /ceiling/i.test(n))).toBe(true);
  });

  it('uses BHD currency', () => {
    const r = BahrainSIOService.calculateContributions(baseBahraini);
    expect(r.currency).toBe('BHD');
  });

  it('honors explicit period', () => {
    const r = BahrainSIOService.calculateContributions(baseBahraini, '2026-03');
    expect(r.period).toBe('2026-03');
  });

  it('defaults to current YYYY-MM period', () => {
    const r = BahrainSIOService.calculateContributions(baseBahraini);
    expect(r.period).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe('BahrainSIOService.calculateContributions — Non-Bahraini', () => {
  it('expat employee pays 0%', () => {
    const r = BahrainSIOService.calculateContributions(baseExpat);
    expect(r.employeeContribution.total).toBe(0);
  });

  it('expat employer pays 3% workplace injury only', () => {
    const r = BahrainSIOService.calculateContributions(baseExpat);
    // 800 × 3% = 24
    expect(r.employerContribution.total).toBeCloseTo(24, 2);
  });
});

describe('BahrainSIOService.validateCPR', () => {
  it('accepts a 9-digit CPR', () => {
    expect(BahrainSIOService.validateCPR('123456789')).toBe(true);
  });

  it('rejects non-9-digit input', () => {
    expect(BahrainSIOService.validateCPR('12345')).toBe(false);
    expect(BahrainSIOService.validateCPR('1234567890')).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(BahrainSIOService.validateCPR('12345678A')).toBe(false);
  });

  it('rejects empty', () => {
    expect(BahrainSIOService.validateCPR('')).toBe(false);
  });
});

describe('BahrainSIOService.calculateBulk', () => {
  it('returns array of calculations per employee', () => {
    const r = BahrainSIOService.calculateBulk([baseBahraini, baseExpat], '2026-06');
    expect(r).toHaveLength(2);
    expect(r[0].period).toBe('2026-06');
  });
});

describe('BahrainSIOService.calculateAnnualEmployerCost', () => {
  it('projects 12× monthly employer contribution', () => {
    const annual = BahrainSIOService.calculateAnnualEmployerCost(baseBahraini);
    expect(annual).toBeCloseTo(170 * 12, 0);
  });
});

describe('BahrainSIOService.getConfig', () => {
  it('exposes salary ceiling and minimum wage', () => {
    const cfg = BahrainSIOService.getConfig();
    expect(cfg.salaryCeiling).toBe(4000);
    expect(cfg.minimumWage).toBe(300);
  });
});

describe('BahrainSIOService.getRatesSummary', () => {
  it('returns rate strings for both Bahraini and expat', () => {
    const r = BahrainSIOService.getRatesSummary();
    expect(r.bahraini.employee.startsWith('9')).toBe(true);
    expect(r.bahraini.employer.startsWith('17')).toBe(true);
    expect(r.nonBahraini.employee).toBe('0%');
    expect(r.nonBahraini.employer.startsWith('3')).toBe(true);
  });
});

describe('BahrainSIOService.validateEmployee', () => {
  it('passes a complete employee', () => {
    const r = BahrainSIOService.validateEmployee({
      ...baseBahraini,
      fullName: 'Mohammed Ali',
      basicSalary: 800,
    });
    expect(r.isValid).toBe(true);
  });

  it('flags missing CPR', () => {
    const r = BahrainSIOService.validateEmployee({
      ...baseBahraini,
      cpr: '',
      fullName: 'X',
      basicSalary: 800,
    });
    expect(r.isValid).toBe(false);
  });
});
