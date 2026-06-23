import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  countryRuleSetService,
  approvalWorkflowTemplateService,
  notificationRuleService,
  auditTrailSettingService,
  resolveActiveRuleSet,
  nextStage,
  auditCapturePolicy,
  HRMS_CONFIG_CONSTANTS,
} from '../hrms-config';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.countryRuleSet = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'rs-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'rs-1', ...data })),
  };
  m.approvalWorkflowTemplate = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'wf-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'wf-1', ...data })),
  };
  m.notificationRule = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'nr-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'nr-1', ...data })),
  };
  m.auditTrailSetting = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'au-1', ...create })),
  };
});

describe('resolveActiveRuleSet', () => {
  it('returns null when none published', () => {
    expect(
      resolveActiveRuleSet(
        [
          {
            status: 'DRAFT' as const,
            version: 'v1',
            effectiveFrom: new Date('2026-01-01'),
            effectiveTo: null,
          },
        ],
        new Date('2026-06-01')
      )
    ).toBeNull();
  });
  it('picks the latest effectiveFrom among published rows', () => {
    const at = new Date('2026-06-01');
    const out = resolveActiveRuleSet(
      [
        {
          status: 'PUBLISHED' as const,
          version: 'v1',
          effectiveFrom: new Date('2026-01-01'),
          effectiveTo: null,
        },
        {
          status: 'PUBLISHED' as const,
          version: 'v2',
          effectiveFrom: new Date('2026-05-01'),
          effectiveTo: null,
        },
      ],
      at
    );
    expect(out?.version).toBe('v2');
  });
  it('excludes rows with effectiveTo in the past', () => {
    const out = resolveActiveRuleSet(
      [
        {
          status: 'PUBLISHED' as const,
          version: 'v1',
          effectiveFrom: new Date('2026-01-01'),
          effectiveTo: new Date('2026-04-01'),
        },
      ],
      new Date('2026-06-01')
    );
    expect(out).toBeNull();
  });
});

describe('nextStage', () => {
  it('returns first unmet stage', () => {
    const stages = [
      { index: 1, role: 'LINE_MANAGER' },
      { index: 2, role: 'HR' },
      { index: 3, role: 'CEO' },
    ];
    expect(nextStage(stages, [])?.index).toBe(1);
    expect(nextStage(stages, [1])?.role).toBe('HR');
    expect(nextStage(stages, [1, 2])?.role).toBe('CEO');
    expect(nextStage(stages, [1, 2, 3])).toBeNull();
  });
});

describe('auditCapturePolicy', () => {
  it('returns defaults when no row', () => {
    const p = auditCapturePolicy([], 'WPS');
    expect(p.captureReads).toBe(false);
    expect(p.captureWrites).toBe(true);
    expect(p.retentionYears).toBe(7);
  });
  it('honours per-domain override', () => {
    const p = auditCapturePolicy(
      [
        {
          domain: 'WPS',
          captureReads: true,
          captureWrites: true,
          captureExports: false,
          retentionYears: 10,
          piiClassification: 'RESTRICTED',
          isActive: true,
        },
      ],
      'WPS'
    );
    expect(p.captureReads).toBe(true);
    expect(p.captureExports).toBe(false);
    expect(p.retentionYears).toBe(10);
    expect(p.piiClassification).toBe('RESTRICTED');
  });
  it('ignores inactive rows', () => {
    const p = auditCapturePolicy(
      [
        {
          domain: 'WPS',
          captureReads: true,
          captureWrites: true,
          captureExports: false,
          retentionYears: 10,
          piiClassification: 'RESTRICTED',
          isActive: false,
        },
      ],
      'WPS'
    );
    expect(p.captureReads).toBe(false);
    expect(p.retentionYears).toBe(7);
  });
});

describe('countryRuleSetService.publish', () => {
  it('refuses to publish a non-DRAFT row', async () => {
    m.countryRuleSet.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'rs-1', tenantId: 'tenant-1', status: 'PUBLISHED' });
    await expect(countryRuleSetService.publish('rs-1', auth)).rejects.toThrow(/DRAFT/);
  });
  it('refuses cross-tenant', async () => {
    m.countryRuleSet.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'rs-1', tenantId: 'other', status: 'DRAFT' });
    await expect(countryRuleSetService.publish('rs-1', auth)).rejects.toThrow(/not found/);
  });
  it('supersedes prior PUBLISHED rows for same (country,domain)', async () => {
    m.countryRuleSet.findUnique = vi.fn().mockResolvedValue({
      id: 'rs-1',
      tenantId: 'tenant-1',
      status: 'DRAFT',
      country: 'UAE',
      domain: 'WPS',
      effectiveFrom: new Date('2026-07-01'),
    });
    m.countryRuleSet.findMany = vi.fn().mockResolvedValueOnce([{ id: 'old-1' }, { id: 'old-2' }]);
    await countryRuleSetService.publish('rs-1', auth);
    expect(m.countryRuleSet.update).toHaveBeenCalledTimes(3); // 2 supersede + 1 publish
    const supersedeCalls = m.countryRuleSet.update.mock.calls.filter(
      (c: any) => c[0].data.status === 'SUPERSEDED'
    );
    expect(supersedeCalls).toHaveLength(2);
    expect(supersedeCalls[0][0].data.supersededById).toBe('rs-1');
  });
});

describe('approvalWorkflowTemplateService.upsert', () => {
  it('saves with defaults when minimal input', async () => {
    await approvalWorkflowTemplateService.upsert(
      {
        templateCode: 'LEAVE_DEFAULT',
        label: 'Default Leave Approval',
        domain: 'LEAVE',
        stagesJson: [{ index: 1, role: 'LINE_MANAGER' }],
      },
      auth
    );
    const call = m.approvalWorkflowTemplate.upsert.mock.calls[0][0];
    expect(call.create.escalationHours).toBe(24);
    expect(call.create.isActive).toBe(true);
  });
});

describe('notificationRuleService.upsert', () => {
  it('captures bilingual templates and channel array', async () => {
    await notificationRuleService.upsert(
      {
        ruleCode: 'WPS_GATED',
        label: 'WPS gated',
        domain: 'WPS',
        trigger: 'CERTIFICATE_GATED',
        channelsJson: ['EMAIL', 'IN_APP'],
        recipientRoles: ['HR_ADMIN'],
        templateText: 'WPS certificate gated',
        templateTextAr: 'تم حظر شهادة WPS',
        severity: 'CRITICAL',
      },
      auth
    );
    const call = m.notificationRule.upsert.mock.calls[0][0];
    expect(call.create.channelsJson).toEqual(['EMAIL', 'IN_APP']);
    expect(call.create.templateTextAr).toBe('تم حظر شهادة WPS');
    expect(call.create.severity).toBe('CRITICAL');
  });
});

describe('auditTrailSettingService.policy', () => {
  it('falls back to default when no setting for domain', async () => {
    m.auditTrailSetting.findMany = vi.fn().mockResolvedValue([]);
    const p = await auditTrailSettingService.policy('tenant-1', 'WPS');
    expect(p.captureReads).toBe(false);
    expect(p.retentionYears).toBe(7);
  });
  it('returns configured policy when present', async () => {
    m.auditTrailSetting.findMany = vi.fn().mockResolvedValue([
      {
        domain: 'WPS',
        captureReads: true,
        captureWrites: true,
        captureExports: true,
        retentionYears: 12,
        piiClassification: 'RESTRICTED',
        isActive: true,
      },
    ]);
    const p = await auditTrailSettingService.policy('tenant-1', 'WPS');
    expect(p.retentionYears).toBe(12);
    expect(p.piiClassification).toBe('RESTRICTED');
  });
});

describe('HRMS_CONFIG_CONSTANTS', () => {
  it('covers GCC countries and shipped compliance domains', () => {
    expect(HRMS_CONFIG_CONSTANTS.SUPPORTED_COUNTRIES).toContain('UAE');
    expect(HRMS_CONFIG_CONSTANTS.SUPPORTED_COUNTRIES).toContain('KSA');
    expect(HRMS_CONFIG_CONSTANTS.SUPPORTED_DOMAINS).toContain('WPS');
    expect(HRMS_CONFIG_CONSTANTS.SUPPORTED_DOMAINS).toContain('SEPARATION');
    expect(HRMS_CONFIG_CONSTANTS.CHANNELS).toContain('EMAIL');
    expect(HRMS_CONFIG_CONSTANTS.SEVERITIES).toContain('CRITICAL');
  });
});
