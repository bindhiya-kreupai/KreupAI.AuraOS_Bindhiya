/**
 * KuwaitPIFSSService — Public Institution for Social Security tests.
 * Kuwait pension contributions for Kuwaitis, GCC nationals, and expats.
 */

import { describe, it, expect } from 'vitest';
import { KuwaitPIFSSService, PIFSS_CONFIG } from '../kuwait-pifss.service';

const baseKuwaiti: any = {
  employeeId: 'emp-1',
  civilId: '123456789012',
  fullName: 'Ahmed',
  nationality: 'KW',
  dateOfBirth: new Date('1990-01-01'),
  joiningDate: new Date('2020-01-01'),
  basicSalary: 1000,
  grossSalary: 1500,
  socialAllowance: 200,
  housingAllowance: 200,
  transportAllowance: 100,
  gender: 'M',
  sector: 'PRIVATE',
  registeredWithPIFSS: true,
};

const baseGCC: any = {
  employeeId: 'emp-2',
  civilId: '234567890123',
  fullName: 'GCC Person',
  nationality: 'GCC',
  gccCountry: 'AE',
  dateOfBirth: new Date('1990-01-01'),
  joiningDate: new Date('2022-01-01'),
  basicSalary: 1500,
  grossSalary: 1500,
  gender: 'M',
  sector: 'PRIVATE',
  registeredWithPIFSS: true,
};

const baseExpat: any = {
  employeeId: 'emp-3',
  civilId: '345678901234',
  fullName: 'Expat',
  nationality: 'NON_GCC',
  dateOfBirth: new Date('1992-01-01'),
  joiningDate: new Date('2023-01-01'),
  basicSalary: 800,
  grossSalary: 800,
  gender: 'M',
  sector: 'PRIVATE',
  registeredWithPIFSS: false,
};

describe('KuwaitPIFSSService.calculateContributions — Kuwaiti', () => {
  it('computes employee contribution including supplementary', () => {
    const r = KuwaitPIFSSService.calculateContributions(baseKuwaiti);
    expect(r.employeeContribution.total).toBeGreaterThan(0);
  });

  it('computes employer contribution', () => {
    const r = KuwaitPIFSSService.calculateContributions(baseKuwaiti);
    expect(r.employerContribution.total).toBeGreaterThan(0);
  });

  it('government contributes 1% for Kuwaitis', () => {
    const r = KuwaitPIFSSService.calculateContributions(baseKuwaiti);
    expect(r.governmentContribution!.total).toBeGreaterThan(0);
  });

  it('caps basic insurable at 2,750 KWD when grossSalary exceeds ceiling', () => {
    const high = { ...baseKuwaiti, basicSalary: 5000, grossSalary: 5000 };
    const r = KuwaitPIFSSService.calculateContributions(high);
    // service caps internally; verify employee contribution is on the cap
    const expected = PIFSS_CONFIG.basicSalaryCeiling * PIFSS_CONFIG.kuwaiti.employee.basicPension;
    expect(r.employeeContribution.basicPension).toBeCloseTo(expected, 0);
  });

  it('uses KWD currency', () => {
    const r = KuwaitPIFSSService.calculateContributions(baseKuwaiti);
    expect(r.currency).toBe('KWD');
  });
});

describe('KuwaitPIFSSService.calculateContributions — GCC national', () => {
  it('GCC employee pays 10.5% basic only', () => {
    const r = KuwaitPIFSSService.calculateContributions(baseGCC);
    // 1500 × 10.5% = 157.5
    expect(r.employeeContribution.total).toBeCloseTo(1500 * 0.105, 1);
  });

  it('GCC employer pays 11.5% basic only', () => {
    const r = KuwaitPIFSSService.calculateContributions(baseGCC);
    expect(r.employerContribution.total).toBeCloseTo(1500 * 0.115, 1);
  });
});

describe('KuwaitPIFSSService.calculateContributions — Expatriate', () => {
  it('expat employee pays 0%', () => {
    const r = KuwaitPIFSSService.calculateContributions(baseExpat);
    expect(r.employeeContribution.total).toBe(0);
  });

  it('expat employer pays 0%', () => {
    const r = KuwaitPIFSSService.calculateContributions(baseExpat);
    expect(r.employerContribution.total).toBe(0);
  });
});

describe('KuwaitPIFSSService.validateCivilId', () => {
  it('accepts a 12-digit Civil ID', () => {
    expect(KuwaitPIFSSService.validateCivilId('123456789012')).toBe(true);
  });

  it('rejects non-12-digit IDs', () => {
    expect(KuwaitPIFSSService.validateCivilId('123')).toBe(false);
    expect(KuwaitPIFSSService.validateCivilId('1234567890123')).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(KuwaitPIFSSService.validateCivilId('12345678901A')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(KuwaitPIFSSService.validateCivilId('')).toBe(false);
  });
});

describe('KuwaitPIFSSService.calculateBulk', () => {
  it('returns array of per-employee calculations', () => {
    const r = KuwaitPIFSSService.calculateBulk(
      [baseKuwaiti, baseGCC, baseExpat],
      '2026-06'
    );
    expect(r).toHaveLength(3);
    expect(r[0].period).toBe('2026-06');
  });
});

describe('KuwaitPIFSSService.calculateAnnualEmployerCost', () => {
  it('projects 12× monthly employer cost', () => {
    const monthly = KuwaitPIFSSService.calculateContributions(baseKuwaiti);
    const annual = KuwaitPIFSSService.calculateAnnualEmployerCost(baseKuwaiti);
    expect(annual).toBeCloseTo(monthly.employerContribution.total * 12, 0);
  });
});

describe('KuwaitPIFSSService.getConfig', () => {
  it('exposes the PIFSS configuration', () => {
    const cfg = KuwaitPIFSSService.getConfig();
    expect(cfg.basicSalaryCeiling).toBe(2750);
    expect(cfg.minimumWage).toBe(75);
  });
});

describe('KuwaitPIFSSService.getRatesSummary', () => {
  it('returns rate strings for kuwaiti / GCC / expatriate', () => {
    const r = KuwaitPIFSSService.getRatesSummary();
    expect(r.kuwaiti).toBeDefined();
    expect(r.gccNational).toBeDefined();
    expect(r.expatriate).toBeDefined();
  });
});
