import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  hrPolicyService,
  hrPolicyExceptionService,
  hrPolicyReviewService,
  hrPolicyCertificateService,
  HR_POLICY_CONSTANTS,
} from '../hr-policies-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.policyDocument = {
    findUnique: vi.fn().mockResolvedValue({ id: 'p-1', tenantId: 'tenant-1', status: 'DRAFT' }),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'p-1', ...data })),
  };
  m.policyAcknowledgement = {
    count: vi.fn().mockResolvedValue(0),
  };
  m.hrPolicyException = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'e-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'e-1', ...data })),
  };
  m.hrPolicyReview = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'r-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
  };
  m.hrPolicyCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
});

describe('hrPolicyService.publish', () => {
  it('throws when policy not found', async () => {
    m.policyDocument.findUnique = vi.fn().mockResolvedValue(null);
    await expect(hrPolicyService.publish({ policyId: 'p-x' }, auth)).rejects.toThrow(/not found/);
  });
  it('sets status PUBLISHED and creates 12-month review by default', async () => {
    const r = await hrPolicyService.publish({ policyId: 'p-1' }, auth);
    expect(m.policyDocument.update).toHaveBeenCalled();
    const update = m.policyDocument.update.mock.calls[0][0];
    expect(update.data.status).toBe('PUBLISHED');
    expect(r.nextReviewAt).toBeInstanceOf(Date);
    const reviewCreate = m.hrPolicyReview.upsert.mock.calls[0][0];
    expect(reviewCreate.create.intervalMonths).toBe(12);
  });
  it('honours custom intervalMonths', async () => {
    await hrPolicyService.publish({ policyId: 'p-1', intervalMonths: 6 }, auth);
    const reviewCreate = m.hrPolicyReview.upsert.mock.calls[0][0];
    expect(reviewCreate.create.intervalMonths).toBe(6);
  });
});

describe('hrPolicyReviewService.complete', () => {
  it('throws when no review exists', async () => {
    m.hrPolicyReview.findUnique = vi.fn().mockResolvedValue(null);
    await expect(
      hrPolicyReviewService.complete({ policyId: 'p-x', outcome: 'NO_CHANGE' }, auth)
    ).rejects.toThrow(/no review/);
  });
  it('rolls dueAt forward by intervalMonths', async () => {
    m.hrPolicyReview.findUnique = vi.fn().mockResolvedValue({ intervalMonths: 12 });
    await hrPolicyReviewService.complete({ policyId: 'p-1', outcome: 'NO_CHANGE' }, auth);
    const call = m.hrPolicyReview.update.mock.calls[0][0];
    expect(call.data.dueAt).toBeInstanceOf(Date);
    expect(call.data.outcome).toBe('NO_CHANGE');
    expect(call.data.lastReviewedBy).toBe('user-1');
  });
});

describe('hrPolicyCertificateService', () => {
  it('gates when overdue reviews exist', async () => {
    m.hrPolicyReview.count = vi.fn().mockResolvedValue(3);
    const cert = await hrPolicyCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/overdue review/);
  });
  it('gates when pending exceptions exist', async () => {
    m.hrPolicyException.count = vi.fn().mockResolvedValue(2);
    const cert = await hrPolicyCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/pending exception/);
  });
  it('gates when ack coverage below threshold', async () => {
    m.policyDocument.findMany = vi.fn().mockResolvedValue([{ id: 'p-1' }, { id: 'p-2' }]); // 2 published policies requiring acks
    m.policyAcknowledgement.count = vi.fn().mockResolvedValueOnce(50).mockResolvedValueOnce(70); // both below 90 on 100 population
    const cert = await hrPolicyCertificateService.generate('2026-06', auth, 100);
    expect(cert.gatingReason).toMatch(/below 90% ack coverage/);
    expect(cert.ackBelowThresholdCount).toBe(2);
  });
  it('reports 100% coverage when no published policies require ack', async () => {
    m.policyDocument.findMany = vi.fn().mockResolvedValue([]);
    const cert = await hrPolicyCertificateService.generate('2026-06', auth, 100);
    expect(Number(cert.ackCoveragePct)).toBe(100);
  });
  it('refuses to sign while gated', async () => {
    m.hrPolicyCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 1 overdue review(s)' });
    await expect(hrPolicyCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});

describe('HR_POLICY_CONSTANTS', () => {
  it('exposes ack coverage threshold', () => {
    expect(HR_POLICY_CONSTANTS.ACK_COVERAGE_THRESHOLD).toBe(90);
  });
});
