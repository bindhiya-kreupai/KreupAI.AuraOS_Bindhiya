/**
 * QatarWPSService — Wage Protection System validation tests.
 */

import { describe, it, expect } from 'vitest';
import { QatarWPSService } from '../qatar-wps.service';

describe('QatarWPSService.validateQID', () => {
  it('accepts an 11-digit QID', () => {
    expect(QatarWPSService.validateQID('12345678901')).toBe(true);
  });

  it('strips dashes and spaces', () => {
    expect(QatarWPSService.validateQID('123-4567-8901')).toBe(true);
    expect(QatarWPSService.validateQID('123 4567 8901')).toBe(true);
  });

  it('rejects fewer than 11 digits', () => {
    expect(QatarWPSService.validateQID('1234567890')).toBe(false);
  });

  it('rejects more than 11 digits', () => {
    expect(QatarWPSService.validateQID('123456789012')).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(QatarWPSService.validateQID('1234567890A')).toBe(false);
  });

  it('rejects empty', () => {
    expect(QatarWPSService.validateQID('')).toBe(false);
  });
});

describe('QatarWPSService.validateIBAN', () => {
  it('accepts a valid Qatar IBAN', () => {
    expect(QatarWPSService.validateIBAN('QA58DOHB00001234567890ABCDEFG')).toBe(true);
  });

  it('strips spaces and dashes', () => {
    expect(QatarWPSService.validateIBAN('QA58 DOHB 0000 1234 5678 90AB CDEFG')).toBe(true);
  });

  it('rejects non-Qatar IBAN prefix', () => {
    expect(QatarWPSService.validateIBAN('AE58DOHB00001234567890ABCDEFG')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(QatarWPSService.validateIBAN('QA58DOHB001')).toBe(false);
  });
});

describe('QatarWPSService.checkMinimumWage', () => {
  const baseEmployee: any = {
    employeeId: 'emp-1',
    qid: '12345678901',
    fullName: 'Ahmed Ali',
    basicSalary: 1000,
    housingAllowance: 500,
    foodAllowance: 300,
    accommodationProvided: false,
    foodProvided: false,
  };

  it('passes employee at minimum wage threshold', () => {
    const r = QatarWPSService.checkMinimumWage(baseEmployee);
    expect(r.isCompliant).toBe(true);
    expect(r.shortfall).toBe(0);
  });

  it('reports shortfall when below minimum', () => {
    const r = QatarWPSService.checkMinimumWage({
      ...baseEmployee,
      basicSalary: 500, // below 1000 minimum basic
      housingAllowance: 100,
      foodAllowance: 100,
    });
    expect(r.isCompliant).toBe(false);
    expect(r.shortfall).toBeGreaterThan(0);
  });

  it('credits accommodation provision against the housing requirement', () => {
    const r = QatarWPSService.checkMinimumWage({
      ...baseEmployee,
      housingAllowance: 0, // not paid
      accommodationProvided: true,
    });
    expect(r.isCompliant).toBe(true);
  });

  it('credits food provision against the food requirement', () => {
    const r = QatarWPSService.checkMinimumWage({
      ...baseEmployee,
      foodAllowance: 0,
      foodProvided: true,
    });
    expect(r.isCompliant).toBe(true);
  });
});

describe('QatarWPSService.getPaymentDeadline', () => {
  it('returns a date in the month following the period', () => {
    const deadline = QatarWPSService.getPaymentDeadline('2026-06');
    expect(deadline).toBeInstanceOf(Date);
    expect(deadline.getMonth()).toBe(6); // July (0-indexed: 0=Jan, 6=Jul)
  });
});

describe('QatarWPSService.isPaymentOverdue', () => {
  it('returns true for a past period (long deadline passed)', () => {
    expect(QatarWPSService.isPaymentOverdue('2020-01')).toBe(true);
  });

  it('returns false for a far-future period', () => {
    expect(QatarWPSService.isPaymentOverdue('2099-12')).toBe(false);
  });
});

describe('QatarWPSService.getDaysUntilDeadline', () => {
  it('returns a number (positive or negative)', () => {
    expect(typeof QatarWPSService.getDaysUntilDeadline('2030-01')).toBe('number');
  });
});

describe('QatarWPSService.getConfig / getBankList', () => {
  it('returns the WPS configuration', () => {
    const cfg = QatarWPSService.getConfig();
    expect(cfg).toBeDefined();
    expect(cfg.minimumWage).toBe(1000);
  });

  it('returns a non-empty bank list', () => {
    const banks = QatarWPSService.getBankList();
    expect(typeof banks).toBe('object');
    expect(Object.keys(banks).length).toBeGreaterThan(0);
  });
});

describe('QatarWPSService.validateEmployees', () => {
  it('returns isValid + errors + warnings + summary structure', () => {
    const r = QatarWPSService.validateEmployees([
      {
        employeeId: 'emp-1',
        qid: '12345678901',
        fullName: 'Valid',
        bankCode: 'DOHB',
        iban: 'QA58DOHB00001234567890ABCDEFG',
        basicSalary: 1000,
        housingAllowance: 500,
        foodAllowance: 300,
        accommodationProvided: false,
        foodProvided: false,
      } as any,
    ]);

    expect(r).toHaveProperty('isValid');
    expect(r).toHaveProperty('errors');
    expect(r).toHaveProperty('warnings');
    expect(r).toHaveProperty('summary');
    expect(r.summary.totalRecords).toBe(1);
  });

  it('flags invalid QID as CRITICAL', () => {
    const r = QatarWPSService.validateEmployees([
      {
        employeeId: 'emp-1',
        qid: 'BAD',
        fullName: 'X',
        bankCode: 'DOHB',
        iban: 'QA58DOHB00001234567890ABCDEFG',
        basicSalary: 1000,
        housingAllowance: 500,
        foodAllowance: 300,
        accommodationProvided: false,
        foodProvided: false,
      } as any,
    ]);

    expect(r.isValid).toBe(false);
    expect(r.errors.some((e) => e.severity === 'CRITICAL')).toBe(true);
  });
});
