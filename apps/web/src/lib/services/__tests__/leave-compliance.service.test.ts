import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  leaveEntitlementService,
  leaveMisuseService,
  leaveMedicalEvidenceService,
  leaveCertificateService,
  evaluateLeaveMisuse,
  LEAVE_CONSTANTS,
} from '../leave-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.leaveEntitlementRule = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'r-1', ...create })),
  };
  m.leaveMisuseFlag = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'f-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'f-1', ...data })),
  };
  m.leaveMedicalEvidence = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'e-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'e-1', ...data })),
  };
  m.leaveCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
  m.leaveRequest = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({ _sum: { totalDays: 0 } }),
  };
  m.leaveEncashment = { count: vi.fn().mockResolvedValue(0) };
  m.leaveCarryForward = { count: vi.fn().mockResolvedValue(0) };
});

describe('evaluateLeaveMisuse', () => {
  it('flags FREQUENT_MONDAY when >50% of leaves are Mondays', () => {
    const dates = [
      new Date('2026-06-01'), // Monday
      new Date('2026-06-08'), // Monday
      new Date('2026-06-15'), // Monday
      new Date('2026-06-22'), // Monday
    ];
    const r = evaluateLeaveMisuse({ recentDates: dates });
    expect(r.flags).toContain('FREQUENT_MONDAY');
  });
  it('flags EXCESSIVE_CONSECUTIVE when >30 days', () => {
    const r = evaluateLeaveMisuse({ recentDates: [], consecutiveDays: 45 });
    expect(r.flags).toContain('EXCESSIVE_CONSECUTIVE');
  });
  it('flags CARRY_OVER_BREACH when carry exceeds max', () => {
    const r = evaluateLeaveMisuse({
      recentDates: [],
      carryOverDays: 40,
      maxCarryForwardDays: 30,
    });
    expect(r.flags).toContain('CARRY_OVER_BREACH');
  });
  it('flags MEDICAL_FORGERY when required but missing', () => {
    const r = evaluateLeaveMisuse({
      recentDates: [],
      requiresMedicalEvidence: true,
      hasMedicalEvidence: false,
    });
    expect(r.flags).toContain('MEDICAL_FORGERY');
  });
  it('returns clean score when no signals', () => {
    const r = evaluateLeaveMisuse({ recentDates: [] });
    expect(r.score).toBe(0);
    expect(r.flags).toEqual([]);
  });
});

describe('leaveEntitlementService.seedDefaults', () => {
  it('seeds full GCC default entitlement table', async () => {
    const r = await leaveEntitlementService.seedDefaults(auth);
    expect(r.created.length).toBe(LEAVE_CONSTANTS.DEFAULT_ENTITLEMENTS.length);
  });
});

describe('leaveMisuseService', () => {
  it('derives severity from explicit score', async () => {
    await leaveMisuseService.raise(
      {
        employeeId: 'e-1',
        flagType: 'FREQUENT_MONDAY',
        score: 75,
      },
      auth
    );
    const call = m.leaveMisuseFlag.create.mock.calls[0][0];
    expect(call.data.severity).toBe('CRITICAL');
  });
  it('computes score from snapshot when not given', async () => {
    await leaveMisuseService.raise(
      {
        employeeId: 'e-1',
        flagType: 'CARRY_OVER_BREACH',
        snapshot: {
          recentDates: [],
          carryOverDays: 50,
          maxCarryForwardDays: 30,
        },
      },
      auth
    );
    const call = m.leaveMisuseFlag.create.mock.calls[0][0];
    expect(call.data.score).toBe(20);
  });
});

describe('leaveMedicalEvidenceService.capture', () => {
  it('sets retentionUntil from retentionYears', async () => {
    await leaveMedicalEvidenceService.capture(
      {
        leaveRequestId: 'r-1',
        employeeId: 'e-1',
        evidenceType: 'MEDICAL_CERTIFICATE',
        retentionYears: 7,
      },
      auth
    );
    const call = m.leaveMedicalEvidence.create.mock.calls[0][0];
    expect(call.data.retentionUntil).toBeInstanceOf(Date);
    expect(call.data.classification).toBe('RESTRICTED');
  });
});

describe('leaveCertificateService', () => {
  it('gates when misuse flags open', async () => {
    m.leaveMisuseFlag.count = vi.fn().mockResolvedValue(2);
    const cert = await leaveCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/misuse flag/);
  });
  it('refuses to sign while gated', async () => {
    m.leaveCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 1 open misuse flag(s)' });
    await expect(leaveCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});
