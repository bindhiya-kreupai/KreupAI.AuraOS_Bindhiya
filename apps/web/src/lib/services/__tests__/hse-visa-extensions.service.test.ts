import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  hseSafetyOfficerService,
  hseHeatStressRuleService,
  HseHeatStressRuleService,
  hseToolboxTalkService,
  hseEmergencyDrillService,
  hseFirstAidStationService,
  hseWelfareInspectionService,
  visaExitDependentService,
  visaExitBenefitsClosureService,
  visaExitCommTemplateService,
  TRANSFER_PRO_ACTIONS,
} from '../hse-visa-extensions';

const prismaMock = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  for (const table of [
    'hseSafetyOfficer',
    'hseHeatStressRule',
    'hseToolboxTalk',
    'hseEmergencyDrill',
    'hseFirstAidStation',
    'hseWelfareInspection',
    'visaExitDependent',
    'visaExitBenefitsClosure',
    'visaExitCommTemplate',
  ]) {
    prismaMock[table] = {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: `${table}-1`, ...data })),
      update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: `${table}-1`, ...data })),
      upsert: vi
        .fn()
        .mockImplementation(async ({ create }: any) => ({ id: `${table}-1`, ...create })),
      count: vi.fn().mockResolvedValue(0),
    };
  }
});

describe('TRANSFER_PRO_ACTIONS (EPIC-29-S04)', () => {
  it('exports a non-empty PRO action chain for TRANSFER scenario', () => {
    expect(TRANSFER_PRO_ACTIONS.length).toBeGreaterThan(0);
    for (const a of TRANSFER_PRO_ACTIONS) {
      expect(a.code).toMatch(/^[A-Z_]+$/);
      expect(a.label.length).toBeGreaterThan(0);
    }
  });
});

describe('HseSafetyOfficerService', () => {
  it('rejects expiry before issuance', async () => {
    await expect(
      hseSafetyOfficerService.upsert(
        {
          employeeId: 'e-1',
          name: 'John',
          certificationIssuedAt: new Date('2026-09-01'),
          certificationExpiresAt: new Date('2026-08-01'),
        },
        auth
      )
    ).rejects.toThrow(/cannot precede/);
  });
  it('defaults role to SAFETY_OFFICER + scope to SITE', async () => {
    const r = await hseSafetyOfficerService.upsert({ employeeId: 'e-1', name: 'John' }, auth);
    expect(r.role).toBe('SAFETY_OFFICER');
    expect(r.scope).toBe('SITE');
  });
});

describe('HseHeatStressRuleService', () => {
  it('rejects month outside 1–12', async () => {
    await expect(
      hseHeatStressRuleService.upsert(
        {
          country: 'AE',
          month: 13,
          noOutdoorWorkFromHour: 12,
          noOutdoorWorkToHour: 15,
          effectiveFrom: new Date(),
        },
        auth
      )
    ).rejects.toThrow(/month/);
  });
  it('rejects out-of-range hours', async () => {
    await expect(
      hseHeatStressRuleService.upsert(
        {
          country: 'AE',
          month: 7,
          noOutdoorWorkFromHour: 25,
          noOutdoorWorkToHour: 15,
          effectiveFrom: new Date(),
        },
        auth
      )
    ).rejects.toThrow(/Hour/i);
  });
  it('isOutdoorWorkBanned true inside same-day window', () => {
    expect(
      HseHeatStressRuleService.isOutdoorWorkBanned(
        { noOutdoorWorkFromHour: 12, noOutdoorWorkToHour: 15 },
        13
      )
    ).toBe(true);
  });
  it('isOutdoorWorkBanned false outside window', () => {
    expect(
      HseHeatStressRuleService.isOutdoorWorkBanned(
        { noOutdoorWorkFromHour: 12, noOutdoorWorkToHour: 15 },
        16
      )
    ).toBe(false);
  });
});

describe('HseToolboxTalkService', () => {
  it('rejects negative attendeeCount', async () => {
    await expect(
      hseToolboxTalkService.record(
        {
          talkCode: 'TBX-1',
          topic: 'PPE',
          deliveredAt: new Date(),
          attendeeCount: -1,
        },
        auth
      )
    ).rejects.toThrow(/cannot be negative/);
  });
  it('derives attendeeCount from attendees array when not provided', async () => {
    const r = await hseToolboxTalkService.record(
      {
        talkCode: 'TBX-1',
        topic: 'PPE',
        deliveredAt: new Date(),
        attendees: ['e1', 'e2', 'e3'],
      },
      auth
    );
    expect(r.attendeeCount).toBe(3);
  });
});

describe('HseEmergencyDrillService', () => {
  it('schedule creates PENDING drill', async () => {
    const r = await hseEmergencyDrillService.schedule(
      {
        siteId: 'site-1',
        drillCode: 'D-1',
        drillType: 'FIRE',
        scheduledAt: new Date(),
      },
      auth
    );
    expect(r.drillType).toBe('FIRE');
    // create call passes through create() — result has data fields
  });
  it('recordResult sets result + conductedAt', async () => {
    const r = await hseEmergencyDrillService.recordResult(
      'd-1',
      {
        conductedAt: new Date(),
        evacuationTimeSeconds: 240,
        participantCount: 50,
        result: 'PASS',
      },
      auth
    );
    expect(r.result).toBe('PASS');
    expect(r.evacuationTimeSeconds).toBe(240);
  });
});

describe('HseFirstAidStationService', () => {
  it('rejects negative certifiedFirstAiderCount', async () => {
    await expect(
      hseFirstAidStationService.upsert(
        {
          siteId: 'site-1',
          stationCode: 'FA-1',
          label: 'Main',
          certifiedFirstAiderCount: -2,
        },
        auth
      )
    ).rejects.toThrow(/cannot be negative/);
  });
});

describe('HseWelfareInspectionService', () => {
  it('counts CRITICAL findings', async () => {
    const r = await hseWelfareInspectionService.record(
      {
        siteId: 'site-1',
        inspectionCode: 'WI-1',
        scope: 'KITCHEN',
        inspectedAt: new Date(),
        findings: [
          { code: 'A', severity: 'CRITICAL', note: 'Leak' },
          { code: 'B', severity: 'MINOR', note: 'Loose tile' },
          { code: 'C', severity: 'CRITICAL', note: 'Cold storage out' },
        ],
        result: 'FAIL',
      },
      auth
    );
    expect(r.criticalFindings).toBe(2);
    expect(r.result).toBe('FAIL');
  });
});

describe('VisaExitDependentService', () => {
  it('addDependent creates PENDING status', async () => {
    const r = await visaExitDependentService.addDependent(
      {
        visaExitCaseId: 'case-1',
        dependentName: 'Spouse',
        relationship: 'SPOUSE',
      },
      auth
    );
    expect(r.cancellationStatus).toBe('PENDING');
  });
  it('markCancelled sets cancelledAt', async () => {
    const r = await visaExitDependentService.markCancelled('d-1', 'https://evidence', auth);
    expect(r.cancellationStatus).toBe('CANCELLED');
    expect(r.cancelledAt).toBeInstanceOf(Date);
  });
});

describe('VisaExitBenefitsClosureService', () => {
  it('seedDefaults reports created categories', async () => {
    const r = await visaExitBenefitsClosureService.seedDefaults('case-1', auth);
    expect(r.created.length).toBeGreaterThan(0);
    expect(r.created).toContain('INSURANCE');
    expect(r.created).toContain('EOS');
  });
  it('close sets CLOSED + closedAt + closedBy', async () => {
    const r = await visaExitBenefitsClosureService.close('bc-1', { amountSettled: 5000 }, auth);
    expect(r.status).toBe('CLOSED');
    expect(r.closedBy).toBe('user-1');
  });
});

describe('VisaExitCommTemplateService', () => {
  it('upsert defaults isActive to true', async () => {
    const r = await visaExitCommTemplateService.upsert(
      {
        templateCode: 'CASE_OPENED_EN',
        trigger: 'CASE_OPENED',
        label: 'Case opened',
      },
      auth
    );
    expect(r.isActive).toBe(true);
  });
});
