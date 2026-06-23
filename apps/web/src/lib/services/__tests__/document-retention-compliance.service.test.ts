import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  docRetentionScheduleService,
  hrDocumentService,
  docLitigationHoldService,
  docDisposalService,
  hrAuditService,
  docComplianceCertificateService,
  DOC_RETENTION_CONSTANTS,
} from '../document-retention-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.docRetentionSchedule = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 's-1', ...data })),
  };
  m.hrDocument = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'd-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'd-1', ...data })),
    updateMany: vi.fn().mockResolvedValue({ count: 3 }),
  };
  m.docLitigationHold = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'h-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'h-1', ...data })),
  };
  m.docDisposalRequest = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
  };
  m.hrAuditCycle = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
  m.hrAuditFinding = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'f-1', ...data })),
    update: vi
      .fn()
      .mockImplementation(async ({ data }: any) => ({ id: 'f-1', auditCycleId: 'c-1', ...data })),
  };
  m.docComplianceCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
});

describe('docRetentionScheduleService.seedDefaults', () => {
  it('seeds all default retention rows', async () => {
    const r = await docRetentionScheduleService.seedDefaults(auth);
    expect(r.created.length).toBe(DOC_RETENTION_CONSTANTS.DEFAULT_RETENTION.length);
  });
});

describe('hrDocumentService.upsert', () => {
  it('derives retentionUntil from schedule when present', async () => {
    m.docRetentionSchedule.findMany = vi
      .fn()
      .mockResolvedValue([{ retentionYears: 7, classification: 'CONFIDENTIAL' }]);
    const issued = new Date('2026-01-01');
    await hrDocumentService.upsert({ recordType: 'CONTRACT', title: 'c1', issuedAt: issued }, auth);
    const call = m.hrDocument.create.mock.calls[0][0];
    expect(call.data.classification).toBe('CONFIDENTIAL');
    expect(call.data.retentionUntil).toBeInstanceOf(Date);
    const years =
      (call.data.retentionUntil.getTime() - issued.getTime()) / (365.25 * 24 * 3600 * 1000);
    expect(Math.round(years)).toBe(7);
  });
  it('leaves retentionUntil null when no schedule', async () => {
    m.docRetentionSchedule.findMany = vi.fn().mockResolvedValue([]);
    await hrDocumentService.upsert({ recordType: 'OTHER', title: 't' }, auth);
    const call = m.hrDocument.create.mock.calls[0][0];
    expect(call.data.retentionUntil).toBeNull();
  });
});

describe('docLitigationHoldService.start', () => {
  it('applies hold to matching ACTIVE documents and sets heldDocCount', async () => {
    await docLitigationHoldService.start(
      { caseNumber: 'C-1', subject: 'wrongful termination', scopeFilter: { employeeId: 'e-1' } },
      auth
    );
    const updateMany = m.hrDocument.updateMany.mock.calls[0][0];
    expect(updateMany.where.employeeId).toBe('e-1');
    expect(updateMany.where.status).toBe('ACTIVE');
    expect(updateMany.where.litigationHoldId).toBeNull();
    const finalize = m.docLitigationHold.update.mock.calls[0][0];
    expect(finalize.data.heldDocCount).toBe(3);
  });
});

describe('docDisposalService.request', () => {
  it('blocks when any document is on litigation hold', async () => {
    m.hrDocument.findMany = vi.fn().mockResolvedValue([{ id: 'd-1', litigationHoldId: 'h-1' }]);
    const r = await docDisposalService.request({ documentIds: ['d-1'], reason: 'expired' }, auth);
    expect(r.status).toBe('BLOCKED');
    expect(r.blockedReason).toMatch(/litigation hold/);
  });
  it('blocks when retention period not yet reached', async () => {
    m.hrDocument.findMany = vi
      .fn()
      .mockResolvedValue([
        { id: 'd-1', retentionUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000) },
      ]);
    const r = await docDisposalService.request({ documentIds: ['d-1'], reason: 'expired' }, auth);
    expect(r.status).toBe('BLOCKED');
    expect(r.blockedReason).toMatch(/retention until/);
  });
  it('accepts when document past retention and not held', async () => {
    m.hrDocument.findMany = vi
      .fn()
      .mockResolvedValue([
        { id: 'd-1', retentionUntil: new Date('2020-01-01'), litigationHoldId: null },
      ]);
    const r = await docDisposalService.request({ documentIds: ['d-1'], reason: 'expired' }, auth);
    expect(r.status).toBe('PENDING');
  });
  it('refuses to execute when not approved', async () => {
    m.docDisposalRequest.findUnique = vi.fn().mockResolvedValue({ status: 'PENDING' });
    await expect(docDisposalService.execute('r-1', auth)).rejects.toThrow(/not approved/);
  });
});

describe('hrAuditService', () => {
  it('raises finding with OPEN status and increments cycle findingsCount', async () => {
    await hrAuditService.raiseFinding(
      {
        auditCycleId: 'c-1',
        severity: 'CRITICAL',
        category: 'RETENTION',
        title: 'missing payroll record',
      },
      auth
    );
    expect(m.hrAuditFinding.create).toHaveBeenCalled();
    const update = m.hrAuditCycle.update.mock.calls[0][0];
    expect(update.data.findingsCount).toEqual({ increment: 1 });
  });
});

describe('docComplianceCertificateService', () => {
  it('gates when CRITICAL findings exist', async () => {
    m.hrAuditFinding.count = vi
      .fn()
      .mockResolvedValueOnce(5) // openFindings
      .mockResolvedValueOnce(2); // critical
    const cert = await docComplianceCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/CRITICAL/);
  });
  it('refuses to sign while gated', async () => {
    m.docComplianceCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 2 CRITICAL finding(s)' });
    await expect(docComplianceCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});
