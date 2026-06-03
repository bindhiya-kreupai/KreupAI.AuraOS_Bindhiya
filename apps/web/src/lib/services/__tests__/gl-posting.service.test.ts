/**
 * GLPostingService — pure-logic tests (balance + transition).
 *
 * Verifies the journal-balance invariant and state-machine matrix without
 * touching Prisma. Real DB flows (createDraft, post, export, reverse) are
 * covered by integration tests separately.
 */

import { describe, it, expect } from 'vitest';
import {
  GLPostingService,
  InvalidGLTransitionError,
  UnbalancedJournalError,
} from '../gl-posting.service';

const svc = new GLPostingService();

describe('GLPostingService.assertBalanced', () => {
  it('accepts equal debits and credits', () => {
    const { totalDebit, totalCredit } = svc.assertBalanced([
      { accountId: 'a', debit: 100 },
      { accountId: 'b', credit: 100 },
    ]);
    expect(totalDebit).toBe(100);
    expect(totalCredit).toBe(100);
  });

  it('accepts multi-line balanced journal with 2dp rounding', () => {
    const { totalDebit, totalCredit } = svc.assertBalanced([
      { accountId: 'a', debit: 33.33 },
      { accountId: 'b', debit: 66.67 },
      { accountId: 'c', credit: 100 },
    ]);
    expect(totalDebit).toBeCloseTo(100, 2);
    expect(totalCredit).toBe(100);
  });

  it('rejects unbalanced journal with UnbalancedJournalError', () => {
    expect(() =>
      svc.assertBalanced([
        { accountId: 'a', debit: 100 },
        { accountId: 'b', credit: 99 },
      ])
    ).toThrow(UnbalancedJournalError);
  });

  it('tolerates floating-point noise within 1 cent', () => {
    expect(() =>
      svc.assertBalanced([
        { accountId: 'a', debit: 33.33 },
        { accountId: 'b', debit: 33.33 },
        { accountId: 'c', debit: 33.34 },
        { accountId: 'd', credit: 100 },
      ])
    ).not.toThrow();
  });
});

describe('GLPostingService transitions', () => {
  it('DRAFT → POSTED / REVERSED only', () => {
    expect(svc.canTransition('DRAFT', 'POSTED')).toBe(true);
    expect(svc.canTransition('DRAFT', 'REVERSED')).toBe(true);
    expect(svc.canTransition('DRAFT', 'EXPORTED')).toBe(false);
  });

  it('POSTED → EXPORTED / REVERSED only', () => {
    expect(svc.canTransition('POSTED', 'EXPORTED')).toBe(true);
    expect(svc.canTransition('POSTED', 'REVERSED')).toBe(true);
    expect(svc.canTransition('POSTED', 'DRAFT')).toBe(false);
  });

  it('EXPORTED → REVERSED only', () => {
    expect(svc.canTransition('EXPORTED', 'REVERSED')).toBe(true);
    expect(svc.canTransition('EXPORTED', 'DRAFT')).toBe(false);
    expect(svc.canTransition('EXPORTED', 'POSTED')).toBe(false);
  });

  it('REVERSED is terminal', () => {
    expect(svc.canTransition('REVERSED', 'DRAFT')).toBe(false);
    expect(svc.canTransition('REVERSED', 'POSTED')).toBe(false);
    expect(svc.canTransition('REVERSED', 'EXPORTED')).toBe(false);
  });

  it('assertTransition throws on illegal moves', () => {
    expect(() => svc.assertTransition('DRAFT', 'EXPORTED')).toThrow(InvalidGLTransitionError);
    expect(() => svc.assertTransition('REVERSED', 'POSTED')).toThrow(/REVERSED.*POSTED/);
  });
});

describe('GL error contracts', () => {
  it('UnbalancedJournalError carries totals in the message', () => {
    const err = new UnbalancedJournalError(120.5, 100);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('UnbalancedJournalError');
    expect(err.message).toMatch(/120\.5/);
    expect(err.message).toMatch(/100/);
  });

  it('InvalidGLTransitionError is a real Error subclass', () => {
    const err = new InvalidGLTransitionError('DRAFT', 'EXPORTED');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('InvalidGLTransitionError');
  });
});
