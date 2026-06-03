/**
 * Exit Management state-machine tests.
 *
 * Verifies the transition matrix is enforced correctly and that the
 * InvalidExitTransitionError / ExitNotClearedError contracts are exposed.
 * No Prisma calls — only state-machine and error-class behaviour.
 */

import { describe, it, expect } from 'vitest';
import { ExitService, InvalidExitTransitionError, ExitNotClearedError } from '../exit.service';

const svc = new ExitService();

describe('ExitService.canTransition', () => {
  it('PENDING → APPROVED / CANCELED only', () => {
    expect(svc.canTransition('PENDING', 'APPROVED')).toBe(true);
    expect(svc.canTransition('PENDING', 'CANCELED')).toBe(true);
    expect(svc.canTransition('PENDING', 'PROCESSING')).toBe(false);
    expect(svc.canTransition('PENDING', 'COMPLETED')).toBe(false);
  });

  it('APPROVED → PROCESSING / CANCELED only', () => {
    expect(svc.canTransition('APPROVED', 'PROCESSING')).toBe(true);
    expect(svc.canTransition('APPROVED', 'CANCELED')).toBe(true);
    expect(svc.canTransition('APPROVED', 'COMPLETED')).toBe(false);
    expect(svc.canTransition('APPROVED', 'PENDING')).toBe(false);
  });

  it('PROCESSING → COMPLETED / CANCELED only', () => {
    expect(svc.canTransition('PROCESSING', 'COMPLETED')).toBe(true);
    expect(svc.canTransition('PROCESSING', 'CANCELED')).toBe(true);
    expect(svc.canTransition('PROCESSING', 'APPROVED')).toBe(false);
    expect(svc.canTransition('PROCESSING', 'PENDING')).toBe(false);
  });

  it('terminal states reject all transitions', () => {
    expect(svc.canTransition('COMPLETED', 'PROCESSING')).toBe(false);
    expect(svc.canTransition('COMPLETED', 'CANCELED')).toBe(false);
    expect(svc.canTransition('CANCELED', 'APPROVED')).toBe(false);
    expect(svc.canTransition('CANCELED', 'PENDING')).toBe(false);
  });
});

describe('ExitService.assertTransition', () => {
  it('throws InvalidExitTransitionError on illegal moves', () => {
    expect(() => svc.assertTransition('COMPLETED', 'PROCESSING')).toThrow(
      InvalidExitTransitionError
    );
    expect(() => svc.assertTransition('PENDING', 'COMPLETED')).toThrow(/PENDING.*COMPLETED/);
  });

  it('is silent on legal moves', () => {
    expect(() => svc.assertTransition('PENDING', 'APPROVED')).not.toThrow();
    expect(() => svc.assertTransition('APPROVED', 'PROCESSING')).not.toThrow();
    expect(() => svc.assertTransition('PROCESSING', 'COMPLETED')).not.toThrow();
  });
});

describe('Exit error contracts', () => {
  it('InvalidExitTransitionError is a real Error subclass', () => {
    const err = new InvalidExitTransitionError('PENDING', 'COMPLETED');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('InvalidExitTransitionError');
  });

  it('ExitNotClearedError carries the user-facing message', () => {
    const err = new ExitNotClearedError();
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ExitNotClearedError');
    expect(err.message).toMatch(/clearances/i);
    expect(err.message).toMatch(/COMPLETED/);
  });
});
