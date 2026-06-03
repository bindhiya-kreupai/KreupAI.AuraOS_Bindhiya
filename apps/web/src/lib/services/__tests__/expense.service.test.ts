/**
 * ExpenseService policy + state-machine tests.
 *
 * Verifies the transition matrix, the InvalidExpenseTransitionError /
 * PolicyViolationError contracts, and the canonical evaluatePolicy
 * decision logic (manager / finance / auto lanes, missing-receipt failure).
 */

import { describe, it, expect } from 'vitest';
import {
  ExpenseService,
  InvalidExpenseTransitionError,
  PolicyViolationError,
} from '../expense.service';

const svc = new ExpenseService();

describe('ExpenseService transitions', () => {
  it('DRAFT → SUBMITTED / CANCELED only', () => {
    expect(svc.canTransition('DRAFT', 'SUBMITTED')).toBe(true);
    expect(svc.canTransition('DRAFT', 'CANCELED')).toBe(true);
    expect(svc.canTransition('DRAFT', 'APPROVED')).toBe(false);
    expect(svc.canTransition('DRAFT', 'PAID')).toBe(false);
  });

  it('SUBMITTED → APPROVED / REJECTED / CANCELED only', () => {
    expect(svc.canTransition('SUBMITTED', 'APPROVED')).toBe(true);
    expect(svc.canTransition('SUBMITTED', 'REJECTED')).toBe(true);
    expect(svc.canTransition('SUBMITTED', 'CANCELED')).toBe(true);
    expect(svc.canTransition('SUBMITTED', 'PAID')).toBe(false);
  });

  it('APPROVED → PAID / CANCELED only', () => {
    expect(svc.canTransition('APPROVED', 'PAID')).toBe(true);
    expect(svc.canTransition('APPROVED', 'CANCELED')).toBe(true);
    expect(svc.canTransition('APPROVED', 'REJECTED')).toBe(false);
  });

  it('REJECTED → DRAFT only (re-open for re-submission)', () => {
    expect(svc.canTransition('REJECTED', 'DRAFT')).toBe(true);
    expect(svc.canTransition('REJECTED', 'SUBMITTED')).toBe(false);
  });

  it('PAID and CANCELED are terminal', () => {
    expect(svc.canTransition('PAID', 'CANCELED')).toBe(false);
    expect(svc.canTransition('CANCELED', 'DRAFT')).toBe(false);
  });

  it('assertTransition throws InvalidExpenseTransitionError on illegal moves', () => {
    expect(() => svc.assertTransition('DRAFT', 'PAID')).toThrow(InvalidExpenseTransitionError);
    expect(() => svc.assertTransition('PAID', 'DRAFT')).toThrow(/PAID/);
  });
});

describe('ExpenseService.evaluatePolicy', () => {
  const baseItem = {
    category: 'MEALS',
    amount: 30,
    currency: 'USD',
    expenseDate: new Date('2026-06-01'),
    receiptUrl: 'https://r/1.jpg',
  };

  it('routes ≤ managerThreshold totals to auto', () => {
    const r = svc.evaluatePolicy([{ ...baseItem, amount: 50 }], {
      categoryCaps: {},
      receiptRequiredOver: 25,
      requiresManagerOver: 100,
      requiresFinanceOver: 1000,
    });
    expect(r.required).toBe('auto');
    expect(r.failures).toEqual([]);
  });

  it('routes manager-threshold totals to manager', () => {
    const r = svc.evaluatePolicy([{ ...baseItem, amount: 300 }], {
      categoryCaps: {},
      receiptRequiredOver: 25,
      requiresManagerOver: 100,
      requiresFinanceOver: 1000,
    });
    expect(r.required).toBe('manager');
  });

  it('routes finance-threshold totals to finance', () => {
    const r = svc.evaluatePolicy([{ ...baseItem, amount: 1500 }], {
      categoryCaps: {},
      receiptRequiredOver: 25,
      requiresManagerOver: 100,
      requiresFinanceOver: 1000,
    });
    expect(r.required).toBe('finance');
  });

  it('blocks submission when a line is above receipt threshold and has no receipt', () => {
    const r = svc.evaluatePolicy([{ ...baseItem, amount: 100, receiptUrl: undefined }], {
      categoryCaps: {},
      receiptRequiredOver: 25,
      requiresManagerOver: 100,
      requiresFinanceOver: 1000,
    });
    expect(r.failures.length).toBeGreaterThan(0);
    expect(r.failures[0]).toMatch(/Receipt required/);
  });

  it('warns (but does not fail) when a line exceeds the category cap', () => {
    const r = svc.evaluatePolicy([{ ...baseItem, amount: 80 }], {
      categoryCaps: { MEALS: 50 },
      receiptRequiredOver: 25,
      requiresManagerOver: 100,
      requiresFinanceOver: 1000,
    });
    expect(r.failures).toEqual([]);
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.warnings[0]).toMatch(/exceeds policy cap/);
  });

  it('defaults to manager lane when no policy is attached', () => {
    const r = svc.evaluatePolicy([{ ...baseItem }], null);
    expect(r.required).toBe('manager');
  });
});

describe('Expense error contracts', () => {
  it('PolicyViolationError carries failures and reason', () => {
    const err = new PolicyViolationError(['Receipt required for MEALS line of 100']);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('PolicyViolationError');
    expect(err.failures).toEqual(['Receipt required for MEALS line of 100']);
    expect(err.message).toMatch(/policy/);
  });
});
