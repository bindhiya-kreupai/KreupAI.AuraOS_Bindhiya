import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aura/database', () => ({
  prisma: {
    redFlagRule: { findMany: vi.fn() },
    redFlagInstance: { create: vi.fn() },
  },
}));

import { prisma } from '@aura/database';
import { selectFiringRules, _handleEventForTest } from '../red-flag-automation.service';
import type { ComplianceEvent } from '@/lib/services/compliance-events';

const p = prisma as unknown as any;

beforeEach(() => vi.clearAllMocks());

describe('selectFiringRules — EPIC-37-S09 pure evaluator', () => {
  it('returns rules whose triggerOn matches AND expression is truthy', () => {
    const firing = selectFiringRules(
      [
        {
          code: 'BIG_PAYROLL',
          isActive: true,
          expression: 'payload.totalNet > thresholds.netCap',
          thresholdJson: { triggerOn: 'payroll.run.completed', netCap: 1_000_000 },
        },
      ],
      {
        type: 'payroll.run.completed',
        tenantId: 't1',
        payload: { totalNet: 2_500_000, employeeCount: 50 },
      }
    );
    expect(firing.map((f) => f.code)).toEqual(['BIG_PAYROLL']);
  });

  it('skips rules whose triggerOn does not match the event type', () => {
    const firing = selectFiringRules(
      [
        {
          code: 'WRONG_TRIGGER',
          isActive: true,
          expression: 'true',
          thresholdJson: { triggerOn: 'employee.hired' },
        },
      ],
      {
        type: 'payroll.run.completed',
        tenantId: 't1',
        payload: { totalNet: 1, employeeCount: 1 },
      }
    );
    expect(firing).toEqual([]);
  });

  it('skips inactive rules even when they would otherwise fire', () => {
    const firing = selectFiringRules(
      [
        {
          code: 'DEACTIVATED',
          isActive: false,
          expression: 'true',
          thresholdJson: { triggerOn: 'employee.hired' },
        },
      ],
      { type: 'employee.hired', tenantId: 't1', payload: {} }
    );
    expect(firing).toEqual([]);
  });

  it('swallows malformed expressions and does not raise', () => {
    const firing = selectFiringRules(
      [
        {
          code: 'BROKEN',
          isActive: true,
          expression: 'totally not a parseable ))((',
          thresholdJson: { triggerOn: 'employee.hired' },
        },
      ],
      { type: 'employee.hired', tenantId: 't1', payload: {} }
    );
    expect(firing).toEqual([]);
  });

  it('exposes thresholds + payload + event to the expression context', () => {
    const firing = selectFiringRules(
      [
        {
          code: 'CONTEXT',
          isActive: true,
          expression: 'thresholds.minHires > 0 && event.tenantId == "tenant-X"',
          thresholdJson: { triggerOn: 'employee.hired', minHires: 1 },
        },
      ],
      { type: 'employee.hired', tenantId: 'tenant-X', payload: { employeeId: 'e1' } }
    );
    expect(firing.map((f) => f.code)).toEqual(['CONTEXT']);
  });
});

describe('_handleEventForTest — DB-driven path', () => {
  it('loads candidates, evaluates, and raises flags via raiseFlag()', async () => {
    p.redFlagRule.findMany.mockResolvedValue([
      {
        id: 'r1',
        code: 'PAYROLL_SPIKE',
        domain: 'PAYROLL',
        severity: 'HIGH',
        isActive: true,
        expression: 'payload.totalNet > thresholds.netCap',
        thresholdJson: { triggerOn: 'payroll.run.completed', netCap: 100 },
      },
    ]);
    p.redFlagInstance.create.mockResolvedValue({ id: 'flag1' });

    const event: ComplianceEvent<'payroll.run.completed'> = {
      eventId: 'evt-1',
      emittedAt: new Date(),
      type: 'payroll.run.completed',
      tenantId: 't1',
      actorId: 'u1',
      payload: {
        payrollRunId: 'pr1',
        period: '2026-06',
        countryCode: 'AE',
        employeeCount: 1,
        totalNet: 5000,
      },
    };

    const stats = await _handleEventForTest(event);
    expect(stats.rulesEvaluated).toBe(1);
    expect(stats.flagsRaised).toBe(1);
    expect(p.redFlagInstance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 't1',
          ruleCode: 'PAYROLL_SPIKE',
          domain: 'PAYROLL',
          severity: 'HIGH',
          sourceType: 'compliance-event',
          sourceId: 'evt-1',
          status: 'OPEN',
        }),
      })
    );
  });

  it('does not raise when the expression evaluates falsy', async () => {
    p.redFlagRule.findMany.mockResolvedValue([
      {
        id: 'r2',
        code: 'BIG_HIRE',
        domain: 'PEOPLE',
        severity: 'MEDIUM',
        isActive: true,
        expression: 'payload.employeeCount > thresholds.headcountCap',
        thresholdJson: { triggerOn: 'employee.hired', headcountCap: 1000 },
      },
    ]);

    const event: ComplianceEvent<'employee.hired'> = {
      eventId: 'evt-2',
      emittedAt: new Date(),
      type: 'employee.hired',
      tenantId: 't1',
      actorId: 'u1',
      payload: { employeeId: 'e1', joiningDate: '2026-06-17', countryCode: 'AE' },
    };

    // employee.hired payload has no employeeCount → expression is falsy.
    const stats = await _handleEventForTest(event);
    expect(stats.flagsRaised).toBe(0);
    expect(p.redFlagInstance.create).not.toHaveBeenCalled();
  });

  it('continues with remaining rules when one throws', async () => {
    p.redFlagRule.findMany.mockResolvedValue([
      {
        id: 'r3',
        code: 'BROKEN',
        domain: 'PEOPLE',
        severity: 'MEDIUM',
        isActive: true,
        expression: 'totally invalid )( syntax',
        thresholdJson: { triggerOn: 'employee.hired' },
      },
      {
        id: 'r4',
        code: 'OK',
        domain: 'PEOPLE',
        severity: 'MEDIUM',
        isActive: true,
        expression: 'true',
        thresholdJson: { triggerOn: 'employee.hired' },
      },
    ]);
    p.redFlagInstance.create.mockResolvedValue({ id: 'flag-ok' });

    const event: ComplianceEvent<'employee.hired'> = {
      eventId: 'evt-3',
      emittedAt: new Date(),
      type: 'employee.hired',
      tenantId: 't1',
      actorId: 'u1',
      payload: { employeeId: 'e1', joiningDate: '2026-06-17', countryCode: 'AE' },
    };

    const stats = await _handleEventForTest(event);
    expect(stats.flagsRaised).toBe(1);
    expect(stats.errored).toBeGreaterThanOrEqual(1);
  });
});
