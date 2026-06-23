import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import { ruleChangeRequestService } from '../gcc-rule-library';

const prismaMock = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'maker-1' };

function setupMocks(packOverride?: Record<string, unknown>) {
  prismaMock.countryRulePack = {
    findUnique: vi.fn().mockResolvedValue({
      id: 'pack-1',
      countryCode: 'AE',
      version: 2,
      status: 'DRAFT',
      ...packOverride,
    }),
    findFirst: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'pack-1', ...data })),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
  };
  prismaMock.ruleChangeRequest = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'req-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'req-1', ...data })),
  };
  prismaMock.$transaction = vi
    .fn()
    .mockImplementation(async (fn: any) =>
      typeof fn === 'function' ? fn(prismaMock) : Promise.all(fn)
    );
}

beforeEach(() => {
  setupMocks();
});

describe('RuleChangeRequestService.request', () => {
  it('creates a PENDING_APPROVAL request with rationale + sourceReference', async () => {
    const result = await ruleChangeRequestService.request(
      {
        rulePackId: 'pack-1',
        action: 'PUBLISH',
        rationale: 'KSA wage subsidy law update effective 2026-09-01',
        sourceReference: 'Royal Decree M/12 2026',
      },
      auth
    );
    expect(prismaMock.ruleChangeRequest.create).toHaveBeenCalled();
    expect(result.status).toBe('PENDING_APPROVAL');
    expect(result.requestedBy).toBe('maker-1');
    expect(result.rationale).toBe('KSA wage subsidy law update effective 2026-09-01');
    expect(result.sourceReference).toBe('Royal Decree M/12 2026');
  });

  it('rejects requests with empty rationale', async () => {
    await expect(
      ruleChangeRequestService.request(
        {
          rulePackId: 'pack-1',
          action: 'PUBLISH',
          rationale: '   ',
          sourceReference: 'Royal Decree M/12 2026',
        },
        auth
      )
    ).rejects.toThrow(/rationale is required/);
  });

  it('rejects requests with empty sourceReference', async () => {
    await expect(
      ruleChangeRequestService.request(
        {
          rulePackId: 'pack-1',
          action: 'PUBLISH',
          rationale: 'New rule',
          sourceReference: '',
        },
        auth
      )
    ).rejects.toThrow(/sourceReference is required/);
  });

  it('rejects PUBLISH request on a non-DRAFT pack', async () => {
    setupMocks({ status: 'ACTIVE' });
    await expect(
      ruleChangeRequestService.request(
        {
          rulePackId: 'pack-1',
          action: 'PUBLISH',
          rationale: 'r',
          sourceReference: 's',
        },
        auth
      )
    ).rejects.toThrow(/cannot request PUBLISH on pack with status ACTIVE/);
  });
});

describe('RuleChangeRequestService.approve — maker-checker', () => {
  it('refuses approval when approver equals requester', async () => {
    prismaMock.ruleChangeRequest.findUnique = vi.fn().mockResolvedValue({
      id: 'req-1',
      rulePackId: 'pack-1',
      action: 'PUBLISH',
      status: 'PENDING_APPROVAL',
      requestedBy: 'maker-1',
    });
    await expect(
      ruleChangeRequestService.approve('req-1', { tenantId: 'tenant-1', userId: 'maker-1' })
    ).rejects.toThrow(/approver must differ from requester/);
  });

  it('allows approval when approver differs from requester and applies PUBLISH', async () => {
    prismaMock.ruleChangeRequest.findUnique = vi.fn().mockResolvedValue({
      id: 'req-1',
      rulePackId: 'pack-1',
      action: 'PUBLISH',
      status: 'PENDING_APPROVAL',
      requestedBy: 'maker-1',
      effectiveFrom: new Date('2026-09-01'),
    });
    const result = await ruleChangeRequestService.approve('req-1', {
      tenantId: 'tenant-1',
      userId: 'checker-1',
    });
    expect(result.status).toBe('APPROVED');
    expect(result.approvedBy).toBe('checker-1');
    // The CountryRulePack pack should have been promoted to ACTIVE
    expect(prismaMock.countryRulePack.update).toHaveBeenCalled();
  });

  it('refuses approval on non-pending requests', async () => {
    prismaMock.ruleChangeRequest.findUnique = vi.fn().mockResolvedValue({
      id: 'req-1',
      status: 'APPROVED',
      requestedBy: 'maker-1',
    });
    await expect(
      ruleChangeRequestService.approve('req-1', { tenantId: 'tenant-1', userId: 'checker-1' })
    ).rejects.toThrow(/cannot approve request in status APPROVED/);
  });
});

describe('RuleChangeRequestService.reject', () => {
  it('refuses rejection when rejecter equals requester (maker-checker)', async () => {
    prismaMock.ruleChangeRequest.findUnique = vi.fn().mockResolvedValue({
      id: 'req-1',
      status: 'PENDING_APPROVAL',
      requestedBy: 'maker-1',
    });
    await expect(
      ruleChangeRequestService.reject('req-1', 'no longer needed', {
        tenantId: 'tenant-1',
        userId: 'maker-1',
      })
    ).rejects.toThrow(/rejecter must differ from requester/);
  });

  it('records rejection with reason when checker differs', async () => {
    prismaMock.ruleChangeRequest.findUnique = vi.fn().mockResolvedValue({
      id: 'req-1',
      status: 'PENDING_APPROVAL',
      requestedBy: 'maker-1',
    });
    const result = await ruleChangeRequestService.reject('req-1', 'gazette pending', {
      tenantId: 'tenant-1',
      userId: 'checker-1',
    });
    expect(result.status).toBe('REJECTED');
    expect(result.rejectionReason).toBe('gazette pending');
  });
});

describe('RuleChangeRequestService.rollback', () => {
  it('refuses rollback when no ACTIVE pack exists', async () => {
    prismaMock.countryRulePack.findFirst = vi.fn().mockResolvedValue(null);
    await expect(
      ruleChangeRequestService.rollback(
        { countryCode: 'AE', rationale: 'oops', sourceReference: 'incident-001' },
        auth
      )
    ).rejects.toThrow(/no ACTIVE rule pack/);
  });

  it('refuses rollback when no prior RETIRED pack exists', async () => {
    prismaMock.countryRulePack.findFirst = vi
      .fn()
      .mockResolvedValueOnce({ id: 'pack-2', countryCode: 'AE', version: 2, status: 'ACTIVE' })
      .mockResolvedValueOnce(null);
    await expect(
      ruleChangeRequestService.rollback(
        { countryCode: 'AE', rationale: 'oops', sourceReference: 'incident-001' },
        auth
      )
    ).rejects.toThrow(/no prior RETIRED pack/);
  });

  it('promotes previous RETIRED pack back to ACTIVE and records ROLLBACK', async () => {
    prismaMock.countryRulePack.findFirst = vi
      .fn()
      .mockResolvedValueOnce({ id: 'pack-2', countryCode: 'AE', version: 2, status: 'ACTIVE' })
      .mockResolvedValueOnce({ id: 'pack-1', countryCode: 'AE', version: 1, status: 'RETIRED' });
    const result = await ruleChangeRequestService.rollback(
      { countryCode: 'AE', rationale: 'regulator paused law', sourceReference: 'incident-001' },
      auth
    );
    expect(prismaMock.countryRulePack.update).toHaveBeenCalledTimes(2);
    expect(result.action).toBe('ROLLBACK');
    expect(result.status).toBe('ROLLED_BACK');
    expect(result.previousVersion).toBe(2);
  });
});
