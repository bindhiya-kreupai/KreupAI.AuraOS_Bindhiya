import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aura/database', () => ({
  prisma: {
    auditLog: { create: vi.fn().mockResolvedValue({ id: 'al-1' }) },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';
import {
  publishComplianceEvent,
  publishComplianceEventAsync,
  subscribeComplianceEvent,
  _clearComplianceSubscribers,
} from '../index';

const p = prisma as unknown as any;

beforeEach(() => {
  vi.clearAllMocks();
  _clearComplianceSubscribers();
});

describe('publishComplianceEvent', () => {
  it('returns the published event with eventId + emittedAt', async () => {
    const out = await publishComplianceEvent({
      type: 'employee.hired',
      tenantId: 't1',
      actorId: 'u1',
      payload: { employeeId: 'e1', joiningDate: '2026-07-01', countryCode: 'AE' },
    });
    expect(out.type).toBe('employee.hired');
    expect(out.eventId).toMatch(/^evt-/);
    expect(out.emittedAt).toBeInstanceOf(Date);
    expect(out.payload.employeeId).toBe('e1');
  });

  it('fires every registered subscriber for the matching event type', async () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    subscribeComplianceEvent('employee.hired', h1);
    subscribeComplianceEvent('employee.hired', h2);
    subscribeComplianceEvent('payroll.run.completed', vi.fn()); // not this type

    await publishComplianceEvent({
      type: 'employee.hired',
      tenantId: 't1',
      actorId: 'u1',
      payload: { employeeId: 'e1', joiningDate: '2026-07-01', countryCode: 'AE' },
    });

    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('does not fire subscribers for a different event type', async () => {
    const h = vi.fn();
    subscribeComplianceEvent('payroll.run.completed', h);

    await publishComplianceEvent({
      type: 'employee.hired',
      tenantId: 't1',
      actorId: 'u1',
      payload: { employeeId: 'e1', joiningDate: '2026-07-01', countryCode: 'AE' },
    });

    expect(h).not.toHaveBeenCalled();
  });

  it('continues past a throwing subscriber and logs the error', async () => {
    const throwing = vi.fn().mockRejectedValue(new Error('handler boom'));
    const okHandler = vi.fn();
    subscribeComplianceEvent('employee.hired', throwing);
    subscribeComplianceEvent('employee.hired', okHandler);

    await publishComplianceEvent({
      type: 'employee.hired',
      tenantId: 't1',
      actorId: 'u1',
      payload: { employeeId: 'e1', joiningDate: '2026-07-01', countryCode: 'AE' },
    });

    expect(throwing).toHaveBeenCalled();
    expect(okHandler).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'employee.hired' }),
      expect.stringMatching(/subscriber threw/)
    );
  });

  it('writes a best-effort AuditLog row tagged COMPLIANCE_EVENT', async () => {
    await publishComplianceEvent({
      type: 'offer.accepted',
      tenantId: 't1',
      actorId: 'u1',
      correlationId: 'offer-42',
      payload: { offerId: 'o42', candidateId: 'c1', acceptedAt: '2026-07-01' },
    });
    // Allow the fire-and-forget audit write to land.
    await new Promise((r) => setTimeout(r, 5));

    expect(p.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 't1',
          userId: 'u1',
          action: 'COMPLIANCE_EVENT',
          resourceType: 'offer.accepted',
          resourceId: 'offer-42',
        }),
      })
    );
  });

  it('does not throw when the audit-log write fails (best-effort)', async () => {
    p.auditLog.create.mockRejectedValueOnce(new Error('db down'));

    await expect(
      publishComplianceEvent({
        type: 'visa.cancelled',
        tenantId: 't1',
        actorId: 'u1',
        payload: { employeeId: 'e1', visaId: 'v1', cancellationDate: '2026-07-01' },
      })
    ).resolves.toBeDefined();

    // Allow the rejected promise to settle.
    await new Promise((r) => setTimeout(r, 5));
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'visa.cancelled' }),
      expect.stringMatching(/audit-log write failed/)
    );
  });
});

describe('publishComplianceEventAsync (fire-and-forget)', () => {
  it('does not throw synchronously when called', () => {
    expect(() =>
      publishComplianceEventAsync({
        type: 'employee.hired',
        tenantId: 't1',
        actorId: 'u1',
        payload: { employeeId: 'e1', joiningDate: '2026-07-01', countryCode: 'AE' },
      })
    ).not.toThrow();
  });
});

describe('subscribeComplianceEvent unsubscribe', () => {
  it('returns a function that removes the subscriber', async () => {
    const h = vi.fn();
    const unsubscribe = subscribeComplianceEvent('bgv.passed', h);

    await publishComplianceEvent({
      type: 'bgv.passed',
      tenantId: 't1',
      actorId: 'u1',
      payload: { bgvCaseId: 'b1', candidateId: 'c1' },
    });
    expect(h).toHaveBeenCalledTimes(1);

    unsubscribe();

    await publishComplianceEvent({
      type: 'bgv.passed',
      tenantId: 't1',
      actorId: 'u1',
      payload: { bgvCaseId: 'b2', candidateId: 'c2' },
    });
    expect(h).toHaveBeenCalledTimes(1); // no second call after unsubscribe
  });
});
