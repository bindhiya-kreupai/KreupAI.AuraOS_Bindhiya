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
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'r-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
    delete: vi.fn().mockResolvedValue({}),
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
    // Cryptographic HMAC-SHA256 signature (audit Pattern 7) — versioned
    // `v1:<payload>:<mac>` shape produced by signWithHmac.
    expect(sig.data.signatureHash).toMatch(/^v1:/);
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

describe('hrFormTemplateService.create', () => {
  it('creates a DRAFT template with schema and audit metadata', async () => {
    const tpl = await hrFormTemplateService.create(
      {
        templateCode: 'CUSTOM_FORM',
        formGroup: 'COMPLIANCE',
        label: 'Custom Form',
        schemaJson: { fields: [{ code: 'reason', label: 'Reason', type: 'text' }] },
      },
      auth
    );
    expect(m.hrFormTemplate.create).toHaveBeenCalled();
    const data = m.hrFormTemplate.create.mock.calls[0][0].data;
    expect(data.status).toBe('DRAFT');
    expect(data.tenantId).toBe('tenant-1');
    expect(data.createdBy).toBe('user-1');
    expect(tpl.templateCode).toBe('CUSTOM_FORM');
  });
  it('rejects missing templateCode', async () => {
    await expect(
      hrFormTemplateService.create({ templateCode: '', formGroup: 'COMPLIANCE', label: 'x' }, auth)
    ).rejects.toThrow(/templateCode required/);
  });
});

describe('hrFormTemplateService.update', () => {
  it('refuses to edit a non-DRAFT template', async () => {
    m.hrFormTemplate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 't-1', tenantId: 'tenant-1', status: 'PUBLISHED' });
    await expect(hrFormTemplateService.update('t-1', { label: 'new' }, auth)).rejects.toThrow(
      /only DRAFT/
    );
  });
});

describe('hrFormTemplateService.createSupersedingVersion', () => {
  it('creates a new DRAFT version and supersedes the original', async () => {
    m.hrFormTemplate.findUnique = vi.fn().mockResolvedValue({
      id: 't-1',
      tenantId: 'tenant-1',
      status: 'PUBLISHED',
      templateCode: 'LEAVE_REQUEST',
      formGroup: 'LEAVE_ATTENDANCE',
      label: 'Leave Request',
      version: '1.0',
      schemaJson: { fields: [] },
    });
    m.hrFormTemplate.create = vi
      .fn()
      .mockResolvedValue({ id: 't-2', version: '2.0', status: 'DRAFT' });
    const draft = await hrFormTemplateService.createSupersedingVersion('t-1', auth);
    expect(draft.version).toBe('2.0');
    const updateArgs = m.hrFormTemplate.update.mock.calls[0][0];
    expect(updateArgs.data.status).toBe('SUPERSEDED');
    expect(updateArgs.data.supersededById).toBe('t-2');
  });
  it('refuses to supersede a non-PUBLISHED template', async () => {
    m.hrFormTemplate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 't-1', tenantId: 'tenant-1', status: 'DRAFT' });
    await expect(hrFormTemplateService.createSupersedingVersion('t-1', auth)).rejects.toThrow(
      /only PUBLISHED/
    );
  });
});

describe('hrFormRoutingService.deleteStage', () => {
  it('deletes and compacts stage order', async () => {
    m.hrFormRouting.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'r-2', tenantId: 'tenant-1', templateId: 't-1', stageOrder: 2 });
    m.hrFormRouting.delete = vi.fn().mockResolvedValue({});
    m.hrFormRouting.findMany = vi.fn().mockResolvedValue([
      { id: 'r-1', stageOrder: 1 },
      { id: 'r-3', stageOrder: 3 },
    ]);
    m.hrFormRouting.update = vi.fn().mockResolvedValue({});
    const res = await hrFormRoutingService.deleteStage('r-2', auth);
    expect(m.hrFormRouting.delete).toHaveBeenCalledWith({ where: { id: 'r-2' } });
    // r-3 had order 3, should be compacted to 2.
    expect(m.hrFormRouting.update).toHaveBeenCalledWith({
      where: { id: 'r-3' },
      data: { stageOrder: 2, updatedBy: 'user-1' },
    });
    expect(res.deleted).toBe('r-2');
  });
});

describe('hrFormRoutingService.reorderStage', () => {
  it('swaps stage order with the previous sibling', async () => {
    m.hrFormRouting.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'r-2', tenantId: 'tenant-1', templateId: 't-1', stageOrder: 2 });
    m.hrFormRouting.findMany = vi.fn().mockResolvedValue([
      { id: 'r-1', stageOrder: 1 },
      { id: 'r-2', stageOrder: 2 },
    ]);
    m.hrFormRouting.update = vi.fn().mockResolvedValue({ id: 'r-2', stageOrder: 1 });
    await hrFormRoutingService.reorderStage('r-2', 'up', auth);
    // First moves self to sentinel, then other to self's order, then self to other's order.
    const calls = m.hrFormRouting.update.mock.calls.map((c: any) => c[0]);
    expect(calls[0]).toEqual({ where: { id: 'r-2' }, data: { stageOrder: -1 } });
    expect(calls[1].data.stageOrder).toBe(2);
    expect(calls[2].data.stageOrder).toBe(1);
  });
});

describe('hrFormSubmissionService.attemptWriteback', () => {
  it('marks SUCCESS with a deterministic ref when target configured', async () => {
    m.hrFormSubmissionState.findUnique = vi.fn().mockResolvedValue({
      id: 's-1',
      tenantId: 'tenant-1',
      status: 'APPROVED',
      templateId: 't-1',
      submissionRef: 'REF-9',
    });
    m.hrFormTemplate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 't-1', writebackTarget: 'leave.request' });
    await hrFormSubmissionService.attemptWriteback('s-1', auth);
    const data = m.hrFormSubmissionState.update.mock.calls[0][0].data;
    expect(data.writebackStatus).toBe('SUCCESS');
    expect(data.writebackRef).toBe('LEAVE-REQUEST:REF-9');
  });
  it('marks FAILED when template has no writeback target', async () => {
    m.hrFormSubmissionState.findUnique = vi.fn().mockResolvedValue({
      id: 's-1',
      tenantId: 'tenant-1',
      status: 'APPROVED',
      templateId: 't-1',
      submissionRef: 'REF-9',
    });
    m.hrFormTemplate.findUnique = vi.fn().mockResolvedValue({ id: 't-1', writebackTarget: null });
    await hrFormSubmissionService.attemptWriteback('s-1', auth);
    const data = m.hrFormSubmissionState.update.mock.calls[0][0].data;
    expect(data.writebackStatus).toBe('FAILED');
  });
  it('refuses writeback when submission not APPROVED', async () => {
    m.hrFormSubmissionState.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 's-1', tenantId: 'tenant-1', status: 'IN_REVIEW' });
    await expect(hrFormSubmissionService.attemptWriteback('s-1', auth)).rejects.toThrow(
      /not APPROVED/
    );
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
