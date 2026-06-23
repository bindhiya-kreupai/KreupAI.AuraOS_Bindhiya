import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  hrFormTemplateService,
  hrFormRoutingService,
  hrFormSubmissionService,
  hrFormCertificateService,
  detectSlaBreach,
  HR_FORMS_CONSTANTS,
} from '../hr-forms-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.hrFormTemplate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 't-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 't-1', ...data })),
  };
  m.hrFormRouting = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'r-1', ...create })),
  };
  m.hrFormSubmissionState = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 's-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 's-1', ...data })),
  };
  m.hrFormSignature = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'sig-1', ...data })),
  };
  m.hrFormCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
});

describe('hrFormTemplateService.seedDefaults', () => {
  it('seeds all default templates', async () => {
    const r = await hrFormTemplateService.seedDefaults(auth);
    expect(r.created.length).toBe(HR_FORMS_CONSTANTS.DEFAULT_TEMPLATES.length);
  });
});

describe('hrFormSubmissionService.start', () => {
  it('throws when template not found', async () => {
    m.hrFormTemplate.findUnique = vi.fn().mockResolvedValue(null);
    await expect(
      hrFormSubmissionService.start(
        { templateId: 't-x', submissionRef: 'r-1', employeeId: 'e-1', payload: {} },
        auth
      )
    ).rejects.toThrow(/not found/);
  });
  it('throws when template not PUBLISHED', async () => {
    m.hrFormTemplate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 't-1', tenantId: 'tenant-1', status: 'DRAFT' });
    await expect(
      hrFormSubmissionService.start(
        { templateId: 't-1', submissionRef: 'r-1', employeeId: 'e-1', payload: {} },
        auth
      )
    ).rejects.toThrow(/not PUBLISHED/);
  });
  it('sets totalStages from routing count when published', async () => {
    m.hrFormTemplate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 't-1', tenantId: 'tenant-1', status: 'PUBLISHED' });
    m.hrFormRouting.count = vi.fn().mockResolvedValue(3);
    await hrFormSubmissionService.start(
      { templateId: 't-1', submissionRef: 'r-1', employeeId: 'e-1', payload: { foo: 'bar' } },
      auth
    );
    const call = m.hrFormSubmissionState.upsert.mock.calls[0][0];
    expect(call.create.totalStages).toBe(3);
  });
});

describe('hrFormSubmissionService.submit', () => {
  it('approves immediately when no stages', async () => {
    m.hrFormSubmissionState.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 's-1', tenantId: 'tenant-1', totalStages: 0 });
    await hrFormSubmissionService.submit('s-1', auth);
    const call = m.hrFormSubmissionState.update.mock.calls[0][0];
    expect(call.data.status).toBe('APPROVED');
  });
  it('moves to IN_REVIEW stage 1 when stages exist', async () => {
    m.hrFormSubmissionState.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 's-1', tenantId: 'tenant-1', totalStages: 2 });
    await hrFormSubmissionService.submit('s-1', auth);
    const call = m.hrFormSubmissionState.update.mock.calls[0][0];
    expect(call.data.status).toBe('IN_REVIEW');
    expect(call.data.currentStage).toBe(1);
    expect(m.hrFormSignature.create).toHaveBeenCalled();
  });
});

describe('hrFormSubmissionService.approveStage', () => {
  it('advances stage when more stages remain', async () => {
    m.hrFormSubmissionState.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 's-1', tenantId: 'tenant-1', currentStage: 1, totalStages: 3 });
    await hrFormSubmissionService.approveStage({ id: 's-1' }, auth);
    const call = m.hrFormSubmissionState.update.mock.calls[0][0];
    expect(call.data.currentStage).toBe(2);
    expect(call.data.status).toBeUndefined();
  });
  it('marks APPROVED on final stage', async () => {
    m.hrFormSubmissionState.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 's-1', tenantId: 'tenant-1', currentStage: 3, totalStages: 3 });
    await hrFormSubmissionService.approveStage({ id: 's-1' }, auth);
    const call = m.hrFormSubmissionState.update.mock.calls[0][0];
    expect(call.data.status).toBe('APPROVED');
  });
  it('records signature with hash on every approve', async () => {
    m.hrFormSubmissionState.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 's-1', tenantId: 'tenant-1', currentStage: 1, totalStages: 2 });
    await hrFormSubmissionService.approveStage({ id: 's-1' }, auth);
    const sig = m.hrFormSignature.create.mock.calls[0][0];
    expect(sig.data.action).toBe('APPROVE');
    expect(sig.data.signatureHash).toMatch(/^hash:user-1:/);
  });
});

describe('detectSlaBreach', () => {
  const routing = [{ stageOrder: 1, slaHours: 24 }];
  it('returns false for terminal states', () => {
    expect(
      detectSlaBreach(
        {
          status: 'APPROVED',
          submittedAt: new Date(),
          currentStage: 1,
          updatedAt: new Date(),
        },
        routing
      )
    ).toBe(false);
  });
  it('returns false when within SLA', () => {
    expect(
      detectSlaBreach(
        {
          status: 'IN_REVIEW',
          submittedAt: new Date(Date.now() - 2 * 3600 * 1000),
          currentStage: 1,
          updatedAt: new Date(Date.now() - 2 * 3600 * 1000),
        },
        routing
      )
    ).toBe(false);
  });
  it('returns true when stage exceeds SLA', () => {
    expect(
      detectSlaBreach(
        {
          status: 'IN_REVIEW',
          submittedAt: new Date(Date.now() - 48 * 3600 * 1000),
          currentStage: 1,
          updatedAt: new Date(Date.now() - 48 * 3600 * 1000),
        },
        routing
      )
    ).toBe(true);
  });
});

describe('hrFormCertificateService', () => {
  it('gates when writeback failures exist', async () => {
    m.hrFormSubmissionState.count = vi
      .fn()
      .mockResolvedValueOnce(0) // submissionsTotal
      .mockResolvedValueOnce(0) // approved
      .mockResolvedValueOnce(0) // rejected
      .mockResolvedValueOnce(0) // pending
      .mockResolvedValueOnce(3); // writeback failures
    const cert = await hrFormCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/writeback failure/);
  });
  it('refuses to sign while gated', async () => {
    m.hrFormCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 1 writeback failure(s)' });
    await expect(hrFormCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});
