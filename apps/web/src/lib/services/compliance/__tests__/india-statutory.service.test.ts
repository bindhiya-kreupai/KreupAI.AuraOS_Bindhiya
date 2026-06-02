/**
 * IndiaStatutoryService — EPF, ESI, Professional Tax, TDS calculation tests.
 * Pure calculation functions; no I/O.
 */

import { describe, it, expect } from 'vitest';
import { IndiaStatutoryService } from '../india-statutory.service';

describe('IndiaStatutoryService.calculatePF', () => {
  it('caps contribution at wage ceiling (15,000 INR) for normal mode', () => {
    const r = IndiaStatutoryService.calculatePF(50000, 0, false);
    expect(r.contributableWage).toBe(15000); // capped
    expect(r.employeeContribution).toBe(1800); // 12% of 15000
  });

  it('uses full Basic+DA when voluntary higher contribution', () => {
    const r = IndiaStatutoryService.calculatePF(50000, 0, true);
    expect(r.contributableWage).toBe(50000);
    expect(r.employeeContribution).toBe(6000); // 12% of 50000
  });

  it('includes DA in wage calculation', () => {
    const r = IndiaStatutoryService.calculatePF(10000, 3000, false);
    expect(r.contributableWage).toBe(13000);
    expect(r.employeeContribution).toBe(1560); // 12% of 13000
  });

  it('splits employer 12% into EPS (8.33% to pension ceiling) + EPF (3.67%)', () => {
    const r = IndiaStatutoryService.calculatePF(12000, 0, false);
    // EPS capped at 15000 ceiling × 8.33% = 1250 (rounded)
    expect(r.employerEPSContribution).toBe(Math.round(12000 * 0.0833));
    expect(r.employerPFContribution).toBe(Math.round(12000 * 0.0367));
  });

  it('caps EPS at pension wage ceiling even for higher salaries', () => {
    const r = IndiaStatutoryService.calculatePF(50000, 0, true);
    // EPS pension wage ceiling = 15000; 15000 × 8.33% = 1250
    expect(r.employerEPSContribution).toBe(1250);
  });

  it('returns admin charges and EDLI', () => {
    const r = IndiaStatutoryService.calculatePF(12000, 0, false);
    expect(r.adminCharges).toBeGreaterThan(0);
    expect(r.edliCharges).toBeGreaterThan(0);
  });
});

describe('IndiaStatutoryService.calculateESI', () => {
  it('is applicable when gross salary ≤ 21,000 INR', () => {
    const r = IndiaStatutoryService.calculateESI(18000);
    expect(r.isApplicable).toBe(true);
    expect(r.employeeContribution).toBeGreaterThan(0);
  });

  it('is NOT applicable when gross salary > 21,000 INR', () => {
    const r = IndiaStatutoryService.calculateESI(25000);
    expect(r.isApplicable).toBe(false);
    expect(r.employeeContribution).toBe(0);
    expect(r.employerContribution).toBe(0);
  });

  it('computes employee 0.75% + employer 3.25% = 4%', () => {
    const r = IndiaStatutoryService.calculateESI(20000);
    expect(r.employeeContribution).toBe(150); // 20000 × 0.75%
    expect(r.employerContribution).toBe(650); // 20000 × 3.25%
    expect(r.totalContribution).toBe(800);
  });
});

describe('IndiaStatutoryService.calculateProfessionalTax', () => {
  it('returns 0 for unknown state', () => {
    const r = IndiaStatutoryService.calculateProfessionalTax(15000, 'XX');
    expect(r.monthlyTax).toBe(0);
    expect(r.stateName).toBe('Unknown');
  });

  it('applies Maharashtra Feb adjustment when salary > 10,000', () => {
    const r = IndiaStatutoryService.calculateProfessionalTax(15000, 'MH', true);
    expect(r.isFebruaryAdjustment).toBe(true);
    expect(r.monthlyTax).toBe(300);
  });

  it('uses standard rate for Maharashtra Non-February months', () => {
    const r = IndiaStatutoryService.calculateProfessionalTax(15000, 'MH', false);
    expect(r.isFebruaryAdjustment).toBe(false);
    expect(r.monthlyTax).toBe(200);
  });

  it('caps annual tax at state-configured maximum', () => {
    const r = IndiaStatutoryService.calculateProfessionalTax(50000, 'MH', false);
    expect(r.annualTax).toBeLessThanOrEqual(2500);
  });
});

describe('IndiaStatutoryService.validatePAN', () => {
  it('accepts a valid 10-character PAN (individual, "P" category)', () => {
    // 4th char must be one of A/B/C/F/G/H/L/J/P/T/K
    expect(IndiaStatutoryService.validatePAN('ABCPE1234F').isValid).toBe(true);
  });

  it('rejects PAN with invalid 4th-character category', () => {
    expect(IndiaStatutoryService.validatePAN('ABCDE1234F').isValid).toBe(false);
  });

  it('rejects shorter PAN', () => {
    expect(IndiaStatutoryService.validatePAN('ABCDE1234').isValid).toBe(false);
  });

  it('rejects PAN with invalid format', () => {
    expect(IndiaStatutoryService.validatePAN('1234567890').isValid).toBe(false);
    expect(IndiaStatutoryService.validatePAN('ABCDEFGHIJ').isValid).toBe(false);
  });
});

describe('IndiaStatutoryService.validateAadhaar', () => {
  it('accepts a 12-digit Aadhaar (first digit ≥ 2)', () => {
    // Aadhaar cannot start with 0 or 1
    expect(IndiaStatutoryService.validateAadhaar('234567890123').isValid).toBe(true);
  });

  it('rejects Aadhaar starting with 0', () => {
    expect(IndiaStatutoryService.validateAadhaar('023456789012').isValid).toBe(false);
  });

  it('rejects Aadhaar starting with 1', () => {
    expect(IndiaStatutoryService.validateAadhaar('123456789012').isValid).toBe(false);
  });

  it('rejects shorter input', () => {
    expect(IndiaStatutoryService.validateAadhaar('12345678').isValid).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(IndiaStatutoryService.validateAadhaar('1234ABCD9012').isValid).toBe(false);
  });
});

describe('IndiaStatutoryService.validateUAN', () => {
  it('accepts a 12-digit UAN', () => {
    expect(IndiaStatutoryService.validateUAN('123456789012').isValid).toBe(true);
  });

  it('rejects non-12-digit UAN', () => {
    expect(IndiaStatutoryService.validateUAN('123').isValid).toBe(false);
  });
});

describe('IndiaStatutoryService.getSupportedStates', () => {
  it('returns a non-empty list of state code/name pairs', () => {
    const states = IndiaStatutoryService.getSupportedStates();
    expect(states.length).toBeGreaterThan(0);
    expect(states[0]).toHaveProperty('code');
    expect(states[0]).toHaveProperty('name');
  });

  it('includes Maharashtra (MH)', () => {
    const states = IndiaStatutoryService.getSupportedStates();
    expect(states.some((s) => s.code === 'MH')).toBe(true);
  });
});

describe('IndiaStatutoryService.calculateAll', () => {
  it('returns combined PF + ESI + PT + TDS calculation', () => {
    const r = IndiaStatutoryService.calculateAll(
      {
        employeeId: 'emp-1',
        basicSalary: 30000,
        dearnessAllowance: 0,
        grossSalary: 45000,
        stateCode: 'KA',
        isNewTaxRegime: true,
        section80CDeductions: 150000,
        section80DDeductions: 25000,
        homeLoanInterest: 0,
        otherDeductions: 0,
      } as any,
      '2025-04'
    );

    expect(r).toHaveProperty('pf');
    expect(r).toHaveProperty('esi');
    expect(r).toHaveProperty('professionalTax');
    expect(r).toHaveProperty('tds');
    expect(r.totalEmployeeDeductions).toBeGreaterThan(0);
  });
});

describe('IndiaStatutoryService.getPFConfig / getESIConfig', () => {
  it('exposes PF configuration', () => {
    const cfg = IndiaStatutoryService.getPFConfig();
    expect(cfg.wageCeiling).toBe(15000);
    expect(cfg.employeeContributionRate).toBe(0.12);
  });

  it('exposes ESI configuration', () => {
    const cfg = IndiaStatutoryService.getESIConfig();
    expect(cfg.wageCeiling).toBe(21000);
  });
});
