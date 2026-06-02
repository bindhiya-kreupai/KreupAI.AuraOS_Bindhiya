import { describe, it, expect } from 'vitest';
import { IndiaProfessionalTaxService } from '../india-professional-tax.service';

describe('IndiaProfessionalTaxService.getSupportedStates', () => {
  it('returns at least 15 states', () => {
    const states = IndiaProfessionalTaxService.getSupportedStates();
    expect(states.length).toBeGreaterThanOrEqual(15);
    const codes = states.map((s) => s.code);
    expect(codes).toEqual(expect.arrayContaining(['MH', 'KA', 'WB', 'TN', 'KL', 'GJ', 'MP']));
  });

  it('annualMaxTax never exceeds Article 276 cap of 2500', () => {
    const states = IndiaProfessionalTaxService.getSupportedStates();
    states.forEach((s) => expect(s.maxAnnualTax).toBeLessThanOrEqual(2500));
  });

  it('each entry has nameLocal + collectionFrequency', () => {
    const states = IndiaProfessionalTaxService.getSupportedStates();
    states.forEach((s) => {
      expect(s.nameLocal).toBeTruthy();
      expect(['MONTHLY', 'HALF_YEARLY', 'MIXED']).toContain(s.collectionFrequency);
    });
  });
});

describe('IndiaProfessionalTaxService.calculateMonthlyPT', () => {
  it('returns 0 PT for salary below threshold (MH)', () => {
    const r = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 5000, 6);
    expect(r.monthlyTax).toBe(0);
  });

  it('applies highest slab for high salary in MH', () => {
    const r = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 50000, 6);
    expect(r.monthlyTax).toBe(200);
    expect(r.applicableSlab).not.toBeNull();
  });

  it('applies mid slab for MH 7501-10000 range', () => {
    const r = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 9000, 6);
    expect(r.monthlyTax).toBe(175);
  });

  it('applies February adjustment for MH high salary', () => {
    const feb = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 50000, 2);
    expect(feb.isFebruaryAdjustment).toBe(true);
    expect(feb.monthlyTax).toBe(300);
  });

  it('does NOT apply February adjustment for MH below februaryMinSalary', () => {
    const feb = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 9000, 2);
    expect(feb.isFebruaryAdjustment).toBe(false);
  });

  it('returns Unknown for unsupported state', () => {
    const r = IndiaProfessionalTaxService.calculateMonthlyPT('XX' as any, 50000, 6);
    expect(r.stateName).toBe('Unknown');
    expect(r.monthlyTax).toBe(0);
    expect(r.applicableSlab).toBeNull();
  });

  it('falls back to current year when year omitted', () => {
    const r = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 50000, 6);
    expect(r.year).toBe(new Date().getFullYear());
  });

  it('respects explicit year', () => {
    const r = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 50000, 6, 2023);
    expect(r.year).toBe(2023);
  });

  it('emits bilingual messages', () => {
    const r = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 50000, 6);
    expect(r.message).toBeTruthy();
    expect(r.messageAr).toBeTruthy();
  });

  it('handles half-yearly basis slab if present (TN)', () => {
    // High salary in TN may trigger half-yearly slab
    const r = IndiaProfessionalTaxService.calculateMonthlyPT('TN', 60000, 6);
    if (r.isHalfYearlyBasis) {
      expect(r.halfYearlyAmount).not.toBeNull();
    }
    expect(r.monthlyTax).toBeGreaterThanOrEqual(0);
  });

  it('caps single month at maxAnnualTax', () => {
    const r = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 100000, 6);
    expect(r.monthlyTax).toBeLessThanOrEqual(r.annualCap);
  });
});

describe('IndiaProfessionalTaxService.calculateAnnualPT', () => {
  it('returns 12-month breakdown', () => {
    const r = IndiaProfessionalTaxService.calculateAnnualPT('MH', Array(12).fill(50000));
    expect(r.monthlyBreakdown).toHaveLength(12);
  });

  it('respects 2500 annual cap for MH (cap reached)', () => {
    const r = IndiaProfessionalTaxService.calculateAnnualPT('MH', Array(12).fill(50000));
    expect(r.totalPTDeducted).toBeLessThanOrEqual(2500);
    expect(r.isCapReached).toBe(true);
  });

  it('returns Unknown for invalid state', () => {
    const r = IndiaProfessionalTaxService.calculateAnnualPT('XX' as any, Array(12).fill(50000));
    expect(r.stateName).toBe('Unknown');
    expect(r.totalPTDeducted).toBe(0);
    expect(r.monthlyBreakdown).toEqual([]);
  });

  it('FY format is YYYY-YY', () => {
    const r = IndiaProfessionalTaxService.calculateAnnualPT('MH', Array(12).fill(50000), 2024);
    expect(r.financialYear).toBe('2024-25');
  });

  it('handles partial salary array (treats missing months as 0)', () => {
    const r = IndiaProfessionalTaxService.calculateAnnualPT('MH', [50000, 50000]);
    expect(r.totalPTDeducted).toBeGreaterThan(0);
  });

  it('excessDeducted is 0 when cap is enforced', () => {
    const r = IndiaProfessionalTaxService.calculateAnnualPT('MH', Array(12).fill(100000));
    expect(r.excessDeducted).toBe(0);
  });

  it('FY months span April to March (year boundary)', () => {
    const r = IndiaProfessionalTaxService.calculateAnnualPT('MH', Array(12).fill(50000), 2024);
    expect(r.monthlyBreakdown[0].month).toBe(4); // April
    expect(r.monthlyBreakdown[0].year).toBe(2024);
    expect(r.monthlyBreakdown[11].month).toBe(3); // March
    expect(r.monthlyBreakdown[11].year).toBe(2025);
  });
});

describe('IndiaProfessionalTaxService.getSlabs', () => {
  it('returns slabs for MH', () => {
    const slabs = IndiaProfessionalTaxService.getSlabs('MH');
    expect(slabs.length).toBe(3);
    expect(slabs[0].monthlyTax).toBe(0);
  });

  it('returns empty for invalid state', () => {
    expect(IndiaProfessionalTaxService.getSlabs('XX' as any)).toEqual([]);
  });

  it('returns immutable copy (mutations do not affect source)', () => {
    const slabs = IndiaProfessionalTaxService.getSlabs('MH');
    slabs.push({ minSalary: 999, maxSalary: 1000, monthlyTax: 999 });
    const fresh = IndiaProfessionalTaxService.getSlabs('MH');
    expect(fresh.length).toBe(3);
  });
});

describe('IndiaProfessionalTaxService.getStateConfig', () => {
  it('returns full config for MH', () => {
    const c = IndiaProfessionalTaxService.getStateConfig('MH');
    expect(c).not.toBeNull();
    expect(c!.stateName).toBe('Maharashtra');
    expect(c!.hasFebruaryAdjustment).toBe(true);
  });

  it('returns null for invalid state', () => {
    expect(IndiaProfessionalTaxService.getStateConfig('XX' as any)).toBeNull();
  });
});

describe('IndiaProfessionalTaxService.isStatePTApplicable', () => {
  it('true for MH/KA/WB/TN', () => {
    ['MH', 'KA', 'WB', 'TN'].forEach((s) =>
      expect(IndiaProfessionalTaxService.isStatePTApplicable(s)).toBe(true)
    );
  });

  it('false for unsupported codes', () => {
    expect(IndiaProfessionalTaxService.isStatePTApplicable('XX')).toBe(false);
    expect(IndiaProfessionalTaxService.isStatePTApplicable('UP')).toBe(false); // UP doesn't levy PT
  });
});

describe('IndiaProfessionalTaxService.validatePTRegistration', () => {
  it('rejects empty registration number', () => {
    const r = IndiaProfessionalTaxService.validatePTRegistration('MH', '');
    expect(r.isValid).toBe(false);
    expect(r.message).toMatch(/required/i);
  });

  it('rejects whitespace-only', () => {
    const r = IndiaProfessionalTaxService.validatePTRegistration('MH', '   ');
    expect(r.isValid).toBe(false);
  });

  it('rejects too-short format', () => {
    const r = IndiaProfessionalTaxService.validatePTRegistration('MH', 'AB1');
    expect(r.isValid).toBe(false);
    expect(r.message).toMatch(/format/i);
  });

  it('rejects too-long format', () => {
    const r = IndiaProfessionalTaxService.validatePTRegistration('MH', 'X'.repeat(25));
    expect(r.isValid).toBe(false);
  });

  it('accepts valid format for MH', () => {
    const r = IndiaProfessionalTaxService.validatePTRegistration('MH', 'PTRC12345678');
    expect(r.isValid).toBe(true);
  });

  it('rejects unknown state', () => {
    const r = IndiaProfessionalTaxService.validatePTRegistration('XX' as any, 'PTRC12345678');
    expect(r.isValid).toBe(false);
  });

  it('emits bilingual error', () => {
    const r = IndiaProfessionalTaxService.validatePTRegistration('MH', '');
    expect(r.messageAr).toBeTruthy();
  });
});

describe('IndiaProfessionalTaxService.getFinancialYearRange', () => {
  it('parses FY string "2024-25"', () => {
    const r = IndiaProfessionalTaxService.getFinancialYearRange('2024-25');
    expect(r.start.getFullYear()).toBe(2024);
    expect(r.start.getMonth()).toBe(3); // April (0-indexed)
    expect(r.end.getFullYear()).toBe(2025);
    expect(r.end.getMonth()).toBe(2); // March
  });

  it('accepts numeric year', () => {
    const r = IndiaProfessionalTaxService.getFinancialYearRange(2024);
    expect(r.start.getFullYear()).toBe(2024);
    expect(r.end.getFullYear()).toBe(2025);
  });
});

describe('IndiaProfessionalTaxService.getFebruaryAdjustmentStates', () => {
  it('returns at least MH', () => {
    const r = IndiaProfessionalTaxService.getFebruaryAdjustmentStates();
    expect(r.length).toBeGreaterThanOrEqual(1);
    expect(r.find((s) => s.stateCode === 'MH')).toBeDefined();
  });

  it('each entry has february and regular amounts', () => {
    const r = IndiaProfessionalTaxService.getFebruaryAdjustmentStates();
    r.forEach((s) => {
      expect(s.februaryAmount).toBeGreaterThan(0);
      expect(s.regularAmount).toBeGreaterThan(0);
      expect(s.messageAr).toBeTruthy();
    });
  });
});

describe('IndiaProfessionalTaxService.getHalfYearlyStates', () => {
  it('returns an array (may be empty if no states use halfyearly slabs)', () => {
    const r = IndiaProfessionalTaxService.getHalfYearlyStates();
    expect(Array.isArray(r)).toBe(true);
    r.forEach((s) => {
      expect(s.halfYearlyAmount).toBeGreaterThan(0);
      expect(s.thresholdSalary).toBeGreaterThan(0);
    });
  });
});

describe('IndiaProfessionalTaxService.comparePTAcrossStates', () => {
  it('returns an entry per supported state when no filter', () => {
    const r = IndiaProfessionalTaxService.comparePTAcrossStates(30000);
    expect(r.length).toBeGreaterThanOrEqual(15);
  });

  it('respects state filter', () => {
    const r = IndiaProfessionalTaxService.comparePTAcrossStates(30000, ['MH', 'KA']);
    expect(r).toHaveLength(2);
  });

  it('results sorted ascending by monthlyPT', () => {
    const r = IndiaProfessionalTaxService.comparePTAcrossStates(30000);
    for (let i = 1; i < r.length; i++) {
      expect(r[i].monthlyPT).toBeGreaterThanOrEqual(r[i - 1].monthlyPT);
    }
  });

  it('annualPT never exceeds maxAnnualTax', () => {
    const r = IndiaProfessionalTaxService.comparePTAcrossStates(100000);
    r.forEach((s) => {
      expect(s.annualPT).toBeLessThanOrEqual(2500);
    });
  });

  it('shows variation across states', () => {
    const r = IndiaProfessionalTaxService.comparePTAcrossStates(30000);
    const unique = new Set(r.map((s) => s.monthlyPT));
    expect(unique.size).toBeGreaterThan(1);
  });
});

describe('IndiaProfessionalTaxService.calculateProRataPT', () => {
  it('zeros out months before joining (joined July)', () => {
    const r = IndiaProfessionalTaxService.calculateProRataPT('MH', 50000, 7, 2024);
    const aprMay = r.monthlyBreakdown.slice(0, 3); // Apr, May, Jun
    aprMay.forEach((m) => expect(m.ptAmount).toBe(0));
  });

  it('charges PT from joining month onward', () => {
    const r = IndiaProfessionalTaxService.calculateProRataPT('MH', 50000, 7, 2024);
    const total = r.monthlyBreakdown.reduce((s, m) => s + m.ptAmount, 0);
    expect(total).toBeGreaterThan(0);
  });

  it('handles joining in Q4 (Jan = before April → previous FY)', () => {
    const r = IndiaProfessionalTaxService.calculateProRataPT('MH', 50000, 1, 2025);
    // FY 2024-25: April 2024 to March 2025; joining Jan 2025 = month index 9
    expect(r.financialYear).toBe('2024-25');
  });
});

describe('IndiaProfessionalTaxService.generatePTReturn', () => {
  const employees = [
    { employeeId: 'e1', employeeName: 'A', designation: 'Eng', grossSalary: 50000 },
    { employeeId: 'e2', employeeName: 'B', designation: 'Mgr', grossSalary: 30000 },
    { employeeId: 'e3', employeeName: 'C', designation: 'Jr', grossSalary: 5000 },
  ];

  it('builds return with correct period', () => {
    const r = IndiaProfessionalTaxService.generatePTReturn('tenant-1', 'MH', 6, 2024, employees);
    expect(r.returnPeriod).toBe('2024-06');
    expect(r.tenantId).toBe('tenant-1');
  });

  it('computes summary totals', () => {
    const r = IndiaProfessionalTaxService.generatePTReturn('tenant-1', 'MH', 6, 2024, employees);
    expect(r.summary.totalEmployees).toBe(3);
    expect(r.summary.totalGrossSalary).toBe(85000);
    expect(r.summary.totalPTCollected).toBeGreaterThan(0);
  });

  it('returns DRAFT status initially', () => {
    const r = IndiaProfessionalTaxService.generatePTReturn('tenant-1', 'MH', 6, 2024, employees);
    expect(r.status).toBe('DRAFT');
  });

  it('falls back to default employerDetails when not provided', () => {
    const r = IndiaProfessionalTaxService.generatePTReturn('tenant-1', 'MH', 6, 2024, employees);
    expect(r.employerDetails.ptRegistrationNumber).toContain('PTRC');
  });

  it('uses provided employerDetails', () => {
    const r = IndiaProfessionalTaxService.generatePTReturn('tenant-1', 'MH', 6, 2024, employees, {
      ptRegistrationNumber: 'PTRC-CUSTOM',
      establishmentName: 'ACME',
      address: '1 Road',
    });
    expect(r.employerDetails.ptRegistrationNumber).toBe('PTRC-CUSTOM');
    expect(r.employerDetails.establishmentName).toBe('ACME');
  });

  it('returns invalid record for unknown state', () => {
    const r = IndiaProfessionalTaxService.generatePTReturn(
      'tenant-1',
      'XX' as any,
      6,
      2024,
      employees
    );
    expect(r.stateName).toBe('Unknown');
    expect(r.employees).toEqual([]);
  });

  it('handles empty employees list', () => {
    const r = IndiaProfessionalTaxService.generatePTReturn('tenant-1', 'MH', 6, 2024, []);
    expect(r.summary.totalEmployees).toBe(0);
    expect(r.summary.totalPTCollected).toBe(0);
  });

  it('computes late filing interest + penalty for past-date filing', () => {
    // Use a long-past period to guarantee filing is late
    const r = IndiaProfessionalTaxService.generatePTReturn('tenant-1', 'MH', 1, 2020, employees);
    expect(r.summary.interestIfLate).toBeGreaterThan(0);
    expect(r.summary.penaltyIfLate).toBeGreaterThan(0);
  });

  it('emits tenant-scoped tenantId in result', () => {
    const r = IndiaProfessionalTaxService.generatePTReturn('tenant-A', 'KA', 6, 2024, employees);
    expect(r.tenantId).toBe('tenant-A');
  });

  it('returnType is MONTHLY for monthly-collection states', () => {
    const r = IndiaProfessionalTaxService.generatePTReturn('tenant-1', 'MH', 6, 2024, employees);
    expect(r.returnType).toBe('MONTHLY');
  });
});
