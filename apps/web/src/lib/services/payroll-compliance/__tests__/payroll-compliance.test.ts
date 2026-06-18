import { describe, it, expect } from 'vitest';
import {
  enforceMinimumWage,
  reconcileStatutoryDeductions,
  checkPayslipCompleteness,
  DEFAULT_MIN_WAGES,
} from '../payroll-compliance.service';

describe('EPIC-29-S-MINWAGE — enforceMinimumWage', () => {
  it('PASS when basic meets UAE national minimum', () => {
    const v = enforceMinimumWage({
      countryCode: 'AE',
      basicSalary: 5000,
      currency: 'AED',
      isNational: true,
    });
    expect(v.outcome).toBe('PASS');
    expect(v.shortfall).toBe(0);
  });

  it('FAIL when below UAE national minimum', () => {
    const v = enforceMinimumWage({
      countryCode: 'AE',
      basicSalary: 3500,
      currency: 'AED',
      isNational: true,
    });
    expect(v.outcome).toBe('FAIL');
    expect(v.applicableMin).toBe(4000);
    expect(v.shortfall).toBe(500);
  });

  it('PASS for non-national in UAE (no statutory minimum)', () => {
    const v = enforceMinimumWage({
      countryCode: 'AE',
      basicSalary: 1500,
      currency: 'AED',
      isNational: false,
    });
    expect(v.outcome).toBe('PASS');
    expect(v.reason.code).toBe('MINWAGE_NOT_APPLICABLE');
  });

  it('FAIL when below KSA Saudization-tracked minimum', () => {
    const v = enforceMinimumWage({
      countryCode: 'SA',
      basicSalary: 3000,
      currency: 'SAR',
      isNational: true,
    });
    expect(v.outcome).toBe('FAIL');
  });

  it('WARN when no policy configured for country', () => {
    const v = enforceMinimumWage({
      countryCode: 'XX',
      basicSalary: 1000,
      currency: 'USD',
      isNational: true,
    });
    expect(v.outcome).toBe('WARN');
    expect(v.reason.code).toBe('MINWAGE_NO_POLICY');
  });

  it('WARN on currency mismatch with policy', () => {
    const v = enforceMinimumWage({
      countryCode: 'AE',
      basicSalary: 5000,
      currency: 'USD',
      isNational: true,
    });
    expect(v.outcome).toBe('WARN');
  });

  it('uses overridePolicy when supplied', () => {
    const v = enforceMinimumWage({
      countryCode: 'AE',
      basicSalary: 5000,
      currency: 'AED',
      isNational: true,
      overridePolicy: {
        countryCode: 'AE',
        nationalMin: 6000,
        nonNationalMin: 0,
        currency: 'AED',
      },
    });
    expect(v.outcome).toBe('FAIL');
  });

  it('default policies have positive minima for national groups', () => {
    for (const p of DEFAULT_MIN_WAGES) {
      expect(p.nationalMin).toBeGreaterThan(0);
    }
  });
});

describe('EPIC-29-S-DEDREC — reconcileStatutoryDeductions', () => {
  it('PASS when amounts reconcile', () => {
    const v = reconcileStatutoryDeductions({
      payslip: [
        { code: 'GOSI', amount: 1000 },
        { code: 'WPS_FEE', amount: 10 },
      ],
      remittance: [
        { code: 'GOSI', amount: 1000 },
        { code: 'WPS_FEE', amount: 10 },
      ],
    });
    expect(v.outcome).toBe('PASS');
  });

  it('WARN on single mismatch', () => {
    const v = reconcileStatutoryDeductions({
      payslip: [{ code: 'GOSI', amount: 1000 }],
      remittance: [{ code: 'GOSI', amount: 990 }],
    });
    expect(v.outcome).toBe('WARN');
    expect(v.mismatches).toHaveLength(1);
    expect(v.mismatches[0].delta).toBe(-10);
  });

  it('FAIL on multiple mismatches', () => {
    const v = reconcileStatutoryDeductions({
      payslip: [
        { code: 'GOSI', amount: 1000 },
        { code: 'WPS', amount: 10 },
      ],
      remittance: [
        { code: 'GOSI', amount: 950 },
        { code: 'WPS', amount: 15 },
      ],
    });
    expect(v.outcome).toBe('FAIL');
    expect(v.mismatches).toHaveLength(2);
  });

  it('flags missing remittance for a payslip code', () => {
    const v = reconcileStatutoryDeductions({
      payslip: [{ code: 'GOSI', amount: 1000 }],
      remittance: [],
    });
    expect(v.outcome).toBe('WARN');
  });

  it('respects toleranceAbs', () => {
    const v = reconcileStatutoryDeductions({
      payslip: [{ code: 'GOSI', amount: 1000 }],
      remittance: [{ code: 'GOSI', amount: 999.5 }],
      toleranceAbs: 1,
    });
    expect(v.outcome).toBe('PASS');
  });
});

describe('EPIC-29-S-PAYSLIP — checkPayslipCompleteness', () => {
  const fullAE = {
    employeeId: 'E001',
    employeeName: 'Ahmed',
    employerName: 'Acme',
    payPeriodStart: '2026-06-01',
    payPeriodEnd: '2026-06-30',
    basicSalary: 8000,
    netPay: 7800,
    wpsReference: 'WPS-9001',
  };

  it('PASS when all mandatory fields populated for AE', () => {
    const v = checkPayslipCompleteness({ countryCode: 'AE', payslip: fullAE });
    expect(v.outcome).toBe('PASS');
    expect(v.missingFields).toHaveLength(0);
  });

  it('WARN when 1-2 fields missing', () => {
    const partial = { ...fullAE, wpsReference: undefined };
    const v = checkPayslipCompleteness({ countryCode: 'AE', payslip: partial });
    expect(v.outcome).toBe('WARN');
    expect(v.missingFields).toContain('wpsReference');
  });

  it('FAIL when 3+ fields missing', () => {
    const v = checkPayslipCompleteness({
      countryCode: 'AE',
      payslip: { employeeId: 'E001' },
    });
    expect(v.outcome).toBe('FAIL');
  });

  it('KSA requires gosiAmount', () => {
    const v = checkPayslipCompleteness({
      countryCode: 'SA',
      payslip: {
        employeeId: 'E001',
        employeeName: 'X',
        employerName: 'Y',
        payPeriodStart: '2026-06-01',
        payPeriodEnd: '2026-06-30',
        basicSalary: 4000,
        netPay: 3800,
      },
    });
    expect(v.missingFields).toContain('gosiAmount');
  });

  it('bilingual reasons populated', () => {
    const v = checkPayslipCompleteness({ countryCode: 'AE', payslip: {} });
    for (const r of v.reasons) {
      expect(r.en.length).toBeGreaterThan(0);
      expect(r.ar.length).toBeGreaterThan(0);
    }
  });
});
