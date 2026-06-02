/**
 * ECRService — Electronic Challan-cum-Return for EPFO filing.
 * Pure-calculation tests for contribution math + validators.
 */

import { describe, it, expect } from 'vitest';
import { ECRService } from '../india-ecr.service';

describe('ECRService.calculateContributions', () => {
  it('computes 12% employee EPF', () => {
    const r = ECRService.calculateContributions({
      epfWages: 15000,
      epsWages: 15000,
      edliWages: 15000,
    } as any);
    expect(r.epfEmployee).toBe(1800);
  });

  it('caps EPS wages at 15,000 ceiling', () => {
    const r = ECRService.calculateContributions({
      epfWages: 50000,
      epsWages: 50000,
      edliWages: 50000,
    } as any);
    // EPS = 15000 × 8.33% = 1250
    expect(r.epsEmployer).toBe(Math.round(15000 * 0.0833));
  });

  it('caps EDLI wages at ceiling', () => {
    const r = ECRService.calculateContributions({
      epfWages: 50000,
      epsWages: 50000,
      edliWages: 50000,
    } as any);
    // EDLI = 15000 × 0.5% = 75
    expect(r.edliEmployer).toBe(Math.round(15000 * 0.005));
  });

  it('admin charges are 0.5% of EPF wages, with Rs 75 minimum', () => {
    const r = ECRService.calculateContributions({
      epfWages: 1000, // too low to hit 0.5%
      epsWages: 1000,
      edliWages: 1000,
    } as any);
    expect(r.adminCharges).toBe(75);
  });

  it('sums totals correctly', () => {
    const r = ECRService.calculateContributions({
      epfWages: 15000,
      epsWages: 15000,
      edliWages: 15000,
    } as any);
    expect(r.grandTotal).toBe(
      r.totalEmployeeContribution + r.totalEmployerContribution
    );
  });
});

describe('ECRService.validateUAN', () => {
  it('accepts a 12-digit UAN', () => {
    expect(ECRService.validateUAN('123456789012')).toBe(true);
  });

  it('rejects non-12-digit', () => {
    expect(ECRService.validateUAN('123')).toBe(false);
  });

  it('rejects non-numeric', () => {
    expect(ECRService.validateUAN('12345678901A')).toBe(false);
  });
});

describe('ECRService.validateEstablishmentId', () => {
  it('returns boolean for a candidate id', () => {
    expect(typeof ECRService.validateEstablishmentId('XX/12345/123')).toBe('boolean');
  });
});

describe('ECRService.getDueDate', () => {
  it('returns a date in the month following the wage month', () => {
    const due = ECRService.getDueDate(new Date('2026-06-01'));
    expect(due).toBeInstanceOf(Date);
    // Due date is typically 15th of next month
    expect(due.getDate()).toBe(15);
  });
});

describe('ECRService.isLate', () => {
  it('returns true when payment date is past the deadline', () => {
    const wageMonth = new Date('2025-01-01');
    const lateDate = new Date('2025-12-01');
    expect(ECRService.isLate(wageMonth, lateDate)).toBe(true);
  });

  it('returns false when payment is on time', () => {
    const wageMonth = new Date('2099-01-01'); // far future
    const earlyDate = new Date('2099-02-01');
    expect(ECRService.isLate(wageMonth, earlyDate)).toBe(false);
  });
});

describe('ECRService.calculatePenalties', () => {
  it('returns zero penalties for on-time payment', () => {
    const amount = 10000;
    const dueDate = new Date('2099-02-15');
    const onTime = new Date('2099-02-10');
    const result = ECRService.calculatePenalties(amount, dueDate, onTime);
    expect(result.interest).toBe(0);
    expect(result.damages).toBe(0);
  });

  it('charges interest + damages when payment is significantly late', () => {
    const amount = 10000;
    const dueDate = new Date('2024-02-15');
    const lateDate = new Date('2025-02-15');
    const result = ECRService.calculatePenalties(amount, dueDate, lateDate);
    expect(result.interest).toBeGreaterThan(0);
    expect(result.damages).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(amount);
  });
});

describe('ECRService.getConfig', () => {
  it('exposes EPFO rates and ceilings', () => {
    const cfg = ECRService.getConfig();
    expect(cfg.epfEmployeeRate).toBe(0.12);
    expect(cfg.epsWageCeiling).toBe(15000);
  });
});
