/**
 * Pure-calculation tests for FullFinalService.calculate.
 *
 * These tests don't touch Prisma — they exercise the jurisdictional rule
 * registry (UAE / KSA / India / default) and the breakdown line composition.
 * Targeted at the v1.0 integration-test gap (#81).
 */

import { describe, it, expect } from '@jest/globals';
import { FullFinalService } from '../full-final.service';

const svc = new FullFinalService();

const base = {
  tenantId: 't1',
  employeeId: 'e1',
  grossSalary: 10000,
  currency: 'AED',
};

describe('FullFinalService.calculate — UAE EOSB', () => {
  it('returns zero EOSB before any service', () => {
    const r = svc.calculate({
      ...base,
      countryCode: 'AE',
      joiningDate: new Date('2026-06-01'),
      lastWorkingDay: new Date('2026-06-01'),
      basicSalary: 10000,
    });
    expect(r.gratuity).toBe(0);
  });

  it('applies 21 days basic per year for <5 years', () => {
    const join = new Date('2024-06-02');
    const lwd = new Date('2026-06-02'); // 2 years exactly
    const r = svc.calculate({
      ...base,
      countryCode: 'AE',
      joiningDate: join,
      lastWorkingDay: lwd,
      basicSalary: 9000,
    });
    // dailyBasic 300 * 21 * 2 = 12600
    expect(r.gratuity).toBeCloseTo(12600, 1);
  });

  it('caps at 24 months basic for long service', () => {
    const join = new Date('1986-06-02');
    const lwd = new Date('2026-06-02'); // 40 years
    const r = svc.calculate({
      ...base,
      countryCode: 'AE',
      joiningDate: join,
      lastWorkingDay: lwd,
      basicSalary: 10000,
    });
    expect(r.gratuity).toBe(10000 * 24);
  });
});

describe('FullFinalService.calculate — KSA Article 84', () => {
  it('uses half-month basic per year under 5 years', () => {
    const r = svc.calculate({
      ...base,
      countryCode: 'SA',
      joiningDate: new Date('2022-06-02'),
      lastWorkingDay: new Date('2026-06-02'), // ~4 years
      basicSalary: 12000,
    });
    // 12000 * (4 * 0.5) = 24000
    expect(r.gratuity).toBeCloseTo(24000, 0);
  });

  it('switches to full-month basic per year beyond 5 years', () => {
    const r = svc.calculate({
      ...base,
      countryCode: 'SA',
      joiningDate: new Date('2016-06-02'),
      lastWorkingDay: new Date('2026-06-02'), // 10 years
      basicSalary: 10000,
    });
    // 10000 * (5*0.5 + 5*1.0) = 10000 * 7.5 = 75000
    expect(r.gratuity).toBeCloseTo(75000, 0);
  });
});

describe('FullFinalService.calculate — India Gratuity Act 1972', () => {
  it('returns zero before 5 years', () => {
    const r = svc.calculate({
      ...base,
      countryCode: 'IN',
      joiningDate: new Date('2024-01-01'),
      lastWorkingDay: new Date('2026-01-01'),
      basicSalary: 50000,
    });
    expect(r.gratuity).toBe(0);
  });

  it('uses (15/26) * basic * years for >=5 years', () => {
    const r = svc.calculate({
      ...base,
      countryCode: 'IN',
      joiningDate: new Date('2020-01-01'),
      lastWorkingDay: new Date('2026-01-01'),
      basicSalary: 52000,
    });
    // 15/26 * 52000 * 6 = 180000
    expect(r.gratuity).toBeCloseTo(180000, 0);
  });

  it('caps at INR 20,00,000', () => {
    const r = svc.calculate({
      ...base,
      countryCode: 'IN',
      joiningDate: new Date('1990-01-01'),
      lastWorkingDay: new Date('2026-01-01'),
      basicSalary: 500000,
    });
    expect(r.gratuity).toBe(2_000_000);
  });
});

describe('FullFinalService.calculate — breakdown composition', () => {
  it('subtracts loan + notice + other deductions from gross', () => {
    const r = svc.calculate({
      ...base,
      countryCode: 'AE',
      joiningDate: new Date('2023-06-02'),
      lastWorkingDay: new Date('2026-06-02'),
      basicSalary: 9000,
      earnedLeaveBalanceDays: 5,
      outstandingLoanAmount: 1500,
      unservedNoticeDays: 7,
      otherDeductions: 200,
    });
    expect(r.loanRecovery).toBe(1500);
    expect(r.noticeRecovery).toBeCloseTo((7 * 9000) / 30, 1);
    expect(r.otherDeductions).toBe(200);
    expect(r.totalDeductions).toBeCloseTo(
      r.loanRecovery + r.noticeRecovery + r.otherDeductions + r.taxAmount,
      1
    );
    expect(r.netPayable).toBeCloseTo(r.grossPayable - r.totalDeductions, 1);
  });

  it('includes a breakdown line for every component (even zeros)', () => {
    const r = svc.calculate({
      ...base,
      countryCode: 'AE',
      joiningDate: new Date('2026-06-02'),
      lastWorkingDay: new Date('2026-06-02'),
      basicSalary: 9000,
    });
    const codes = r.breakdown.map((l) => l.code).sort();
    expect(codes).toEqual([
      'BONUS_PR',
      'GRATUITY',
      'LEAVE_ENC',
      'LOAN',
      'NOTICE_REC',
      'OTHER_DEDN',
      'OTHER_EARN',
      'TAX',
      'UNPAID_SAL',
    ]);
  });
});
