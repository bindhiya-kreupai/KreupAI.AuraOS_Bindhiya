import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  checklistCertificateService,
  checklistRunService,
  checklistTemplateService,
  complianceExceptionService,
  redFlagService,
  RED_FLAG_RULE_SEEDS,
  TEMPLATE_SEEDS,
} from '../checklist-engine';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.checklistTemplate = {
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'tpl-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'tpl-1', ...data })),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
  };
  m.checklistTemplateItem = {
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'item-1', ...create })),
  };
  m.redFlagRule = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'rule-1', ...data })),
  };
  m.checklistRun = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'run-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'run-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  m.checklistRunItem = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ri-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ri-1', ...data })),
  };
  m.redFlagInstance = {
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'flag-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'flag-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  m.complianceException = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'exc-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'exc-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  m.checklistCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
  m.$transaction = vi
    .fn()
    .mockImplementation(async (fn: any) => (typeof fn === 'function' ? fn(m) : Promise.all(fn)));
});

describe('seed integrity', () => {
  it('seeds templates across all major domains', () => {
    const domains = new Set(TEMPLATE_SEEDS.map((t) => t.domain));
    for (const need of [
      'HR_RECORDS',
      'PAYROLL',
      'WPS',
      'SOCIAL_INSURANCE',
      'NATIONALIZATION',
      'IMMIGRATION',
      'LEAVE',
      'ATTENDANCE_OT',
      'HSE',
      'SEPARATION',
      'AUDIT',
    ]) {
      expect(domains.has(need)).toBe(true);
    }
  });

  it('every template item carries control objective + weighting', () => {
    for (const t of TEMPLATE_SEEDS) {
      for (const i of t.items) {
        expect(i.controlObjective).toBeTruthy();
        expect(i.description).toBeTruthy();
      }
    }
  });

  it('red-flag rule seeds cover key compliance pillars', () => {
    const codes = RED_FLAG_RULE_SEEDS.map((r) => r.code);
    expect(codes).toContain('RF_VISA_EXPIRED');
    expect(codes).toContain('RF_WPS_LATE');
    expect(codes).toContain('RF_SALARY_DELAY');
    expect(codes).toContain('RF_NATIONALIZATION_SHORTFALL');
    expect(codes).toContain('RF_OT_OVER_CAP');
  });
});

describe('checklistTemplateService.approve', () => {
  it('retires the prior ACTIVE template for the same code', async () => {
    m.checklistTemplate.findUnique.mockResolvedValue({
      id: 'tpl-new',
      tenantId: 'tenant-1',
      code: 'CHK_PAYROLL_MASTER',
      status: 'DRAFT',
    });
    await checklistTemplateService.approve('tpl-new', auth);
    expect(m.checklistTemplate.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'RETIRED' }),
      })
    );
  });

  it('refuses to approve a RETIRED template', async () => {
    m.checklistTemplate.findUnique.mockResolvedValue({ status: 'RETIRED' });
    await expect(checklistTemplateService.approve('x', auth)).rejects.toThrow(/RETIRED/);
  });
});

describe('checklistRunService.assess', () => {
  it('refuses to mark a mandatory item as PENDING', async () => {
    m.checklistRunItem.findUnique.mockResolvedValue({ id: 'ri-1' });
    m.checklistRun.findUnique.mockResolvedValue({ id: 'run-1', templateId: 'tpl-1' });
    m.checklistTemplate.findUnique.mockResolvedValue({
      id: 'tpl-1',
      items: [{ code: 'X', isMandatory: true, evidenceRequired: false }],
    });
    await expect(
      checklistRunService.assess({ runId: 'run-1', itemCode: 'X', status: 'PENDING' }, auth)
    ).rejects.toThrow(/mandatory/);
  });

  it('requires evidence URL for COMPLIANT when evidence is required', async () => {
    m.checklistRunItem.findUnique.mockResolvedValue({ id: 'ri-1' });
    m.checklistRun.findUnique.mockResolvedValue({ id: 'run-1', templateId: 'tpl-1' });
    m.checklistTemplate.findUnique.mockResolvedValue({
      id: 'tpl-1',
      items: [{ code: 'X', isMandatory: true, evidenceRequired: true }],
    });
    await expect(
      checklistRunService.assess({ runId: 'run-1', itemCode: 'X', status: 'COMPLIANT' }, auth)
    ).rejects.toThrow(/evidence/);
  });
});

describe('checklistRunService maker-checker', () => {
  it('approveRun refuses when preparer === approver', async () => {
    m.checklistRun.findUnique.mockResolvedValue({
      id: 'run-1',
      status: 'SUBMITTED',
      preparerId: 'user-1',
    });
    await expect(checklistRunService.approveRun('run-1', auth)).rejects.toThrow(/maker-checker/);
  });

  it('approveRun succeeds when preparer != approver', async () => {
    m.checklistRun.findUnique.mockResolvedValue({
      id: 'run-1',
      status: 'SUBMITTED',
      preparerId: 'user-other',
    });
    const r = await checklistRunService.approveRun('run-1', auth);
    expect(r.status).toBe('APPROVED');
  });

  it('submit refuses while items remain PENDING', async () => {
    m.checklistRun.findUnique.mockResolvedValue({
      id: 'run-1',
      preparerId: 'user-1',
      items: [{ status: 'COMPLIANT' }, { status: 'PENDING' }],
    });
    await expect(checklistRunService.submit('run-1', auth)).rejects.toThrow(/PENDING/);
  });
});

describe('redFlagService.raiseFlag', () => {
  it('creates a new red-flag instance and links to a run item when provided', async () => {
    m.checklistRunItem.findUnique.mockResolvedValue({ id: 'ri-1' });
    await redFlagService.raiseFlag(
      {
        ruleCode: 'RF_VISA_EXPIRED',
        domain: 'IMMIGRATION',
        severity: 'CRITICAL',
        sourceType: 'visa',
        sourceId: 'visa-1',
        checklistRunId: 'run-1',
        itemCode: 'IMM_VISA_VALID',
      },
      auth
    );
    expect(m.redFlagInstance.create).toHaveBeenCalled();
    expect(m.checklistRunItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'NON_COMPLIANT', autoEvaluated: true }),
      })
    );
  });
});

describe('complianceExceptionService', () => {
  it('countOpenCritical counts only OPEN CRITICAL rows', async () => {
    m.complianceException.count.mockResolvedValue(2);
    const n = await complianceExceptionService.countOpenCritical('tenant-1');
    expect(n).toBe(2);
    expect(m.complianceException.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ severity: 'CRITICAL', status: 'OPEN' }),
      })
    );
  });
});

describe('checklistCertificateService', () => {
  it('generate sets gating when CRITICAL flags > 0', async () => {
    m.checklistRun.count.mockResolvedValue(5);
    m.redFlagInstance.count.mockResolvedValue(2);
    m.complianceException.count.mockResolvedValue(0);
    const c = await checklistCertificateService.generate('PAYROLL', '2026-06', auth);
    expect(c.gatingReason).toMatch(/critical red flag/);
  });

  it('generate sets gating when critical exceptions > 0', async () => {
    m.checklistRun.count.mockResolvedValue(5);
    m.redFlagInstance.count.mockResolvedValue(0);
    m.complianceException.count.mockResolvedValue(1);
    const c = await checklistCertificateService.generate('PAYROLL', '2026-06', auth);
    expect(c.gatingReason).toMatch(/critical exception/);
  });

  it('sign refuses while gated', async () => {
    m.checklistCertificate.findUnique.mockResolvedValue({
      id: 'cert-1',
      gatingReason: 'Blocked: 1 critical exception(s) open',
    });
    await expect(checklistCertificateService.sign('PAYROLL', '2026-06', [], auth)).rejects.toThrow(
      /gated/
    );
  });
});
