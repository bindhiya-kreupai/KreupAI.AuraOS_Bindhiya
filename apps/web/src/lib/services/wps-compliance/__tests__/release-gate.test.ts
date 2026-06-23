import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aura/database', () => ({
  prisma: {
    wpsPeriodSubmission: { findUnique: vi.fn() },
    auditLog: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

vi.mock('../submission.service', () => {
  class FakeSubmissionService {
    submit = vi.fn().mockResolvedValue({ id: 'sub-1', status: 'SUBMITTED' });
  }
  return { WpsSubmissionService: FakeSubmissionService };
});

vi.mock('@/lib/audit/audit.service', () => ({
  auditService: { log: vi.fn().mockResolvedValue('audit-id') },
  AuditAction: { SETTINGS_UPDATED: 'SETTINGS_UPDATED' },
  AuditSeverity: { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH' },
}));

import { prisma } from '@aura/database';
import { WpsReleaseGateService } from '../release-gate.service';

const p = prisma as unknown as any;

beforeEach(() => {
  vi.clearAllMocks();
});

const TENANT = 't1';
const PREPARER = 'user-preparer';
const RELEASER = 'user-releaser';

describe('WpsReleaseGateService.release — EPIC-11 SoD', () => {
  it('REFUSES when releaser was the creator of the submission', async () => {
    p.wpsPeriodSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'VALIDATED',
      createdBy: PREPARER,
      updatedBy: null,
      tenantId: TENANT,
    });
    const svc = new WpsReleaseGateService();
    const out = await svc.release(
      { submissionId: 'sub-1' },
      { tenantId: TENANT, userId: PREPARER }
    );
    expect(out.released).toBe(false);
    if (!out.released) {
      expect(out.reason).toBe('PREPARER_IS_RELEASER');
      expect(out.reasonAr.length).toBeGreaterThan(0);
    }
  });

  it('REFUSES when releaser was the last updater', async () => {
    p.wpsPeriodSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'VALIDATED',
      createdBy: 'other-user',
      updatedBy: PREPARER,
      tenantId: TENANT,
    });
    const svc = new WpsReleaseGateService();
    const out = await svc.release(
      { submissionId: 'sub-1' },
      { tenantId: TENANT, userId: PREPARER }
    );
    expect(out.released).toBe(false);
    if (!out.released) expect(out.reason).toBe('PREPARER_IS_RELEASER');
  });

  it('REFUSES when releaser has a prior preparer audit row', async () => {
    p.wpsPeriodSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'VALIDATED',
      createdBy: 'other-user',
      updatedBy: 'someone-else',
      tenantId: TENANT,
    });
    p.auditLog.findFirst.mockResolvedValue({ id: 'audit-x' });
    const svc = new WpsReleaseGateService();
    const out = await svc.release(
      { submissionId: 'sub-1' },
      { tenantId: TENANT, userId: RELEASER }
    );
    expect(out.released).toBe(false);
    if (!out.released) expect(out.reason).toBe('PREPARER_AUDIT_HIT');
  });

  it('REFUSES when status is not VALIDATED or GENERATED', async () => {
    p.wpsPeriodSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'DRAFT',
      createdBy: PREPARER,
      updatedBy: null,
      tenantId: TENANT,
    });
    const svc = new WpsReleaseGateService();
    const out = await svc.release(
      { submissionId: 'sub-1' },
      { tenantId: TENANT, userId: RELEASER }
    );
    expect(out.released).toBe(false);
    if (!out.released) expect(out.reason).toBe('STATUS_NOT_RELEASABLE');
  });

  it('ACCEPTS when releaser is distinct from preparer', async () => {
    p.wpsPeriodSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'VALIDATED',
      createdBy: PREPARER,
      updatedBy: null,
      tenantId: TENANT,
    });
    p.auditLog.findFirst.mockResolvedValue(null);
    const svc = new WpsReleaseGateService();
    const out = await svc.release(
      { submissionId: 'sub-1' },
      { tenantId: TENANT, userId: RELEASER }
    );
    expect(out.released).toBe(true);
    if (out.released) {
      expect(out.releasedBy).toBe(RELEASER);
      expect(out.forced).toBe(false);
    }
  });

  it('FORCE refused without COMPLIANCE_OFFICER role', async () => {
    p.wpsPeriodSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'VALIDATED',
      createdBy: PREPARER,
      updatedBy: null,
      tenantId: TENANT,
    });
    const svc = new WpsReleaseGateService();
    const out = await svc.release(
      { submissionId: 'sub-1', force: true, bypassJustification: 'auditor request' },
      { tenantId: TENANT, userId: PREPARER, roles: ['PAYROLL_OFFICER'] }
    );
    expect(out.released).toBe(false);
    if (!out.released) expect(out.reason).toBe('FORCE_DENIED_ROLE');
  });

  it('FORCE refused when justification is missing', async () => {
    p.wpsPeriodSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'VALIDATED',
      createdBy: PREPARER,
      updatedBy: null,
      tenantId: TENANT,
    });
    const svc = new WpsReleaseGateService();
    const out = await svc.release(
      { submissionId: 'sub-1', force: true },
      { tenantId: TENANT, userId: PREPARER, roles: ['COMPLIANCE_OFFICER'] }
    );
    expect(out.released).toBe(false);
    if (!out.released) expect(out.reason).toBe('FORCE_MISSING_JUSTIFICATION');
  });

  it('FORCE accepted with COMPLIANCE_OFFICER + 10+ char justification', async () => {
    p.wpsPeriodSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'VALIDATED',
      createdBy: PREPARER,
      updatedBy: null,
      tenantId: TENANT,
    });
    const svc = new WpsReleaseGateService();
    const out = await svc.release(
      {
        submissionId: 'sub-1',
        force: true,
        bypassJustification: 'Emergency release at month-end',
      },
      { tenantId: TENANT, userId: PREPARER, roles: ['COMPLIANCE_OFFICER'] }
    );
    expect(out.released).toBe(true);
    if (out.released) expect(out.forced).toBe(true);
  });
});
